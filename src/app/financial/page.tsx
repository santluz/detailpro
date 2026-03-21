'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { financialService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import {
  Plus, TrendingUp, TrendingDown, DollarSign, X, Loader2, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const INCOME_CATEGORIES = ['Serviço', 'Venda de Produto', 'Outros'];
const EXPENSE_CATEGORIES = ['Produto', 'Funcionário', 'Aluguel', 'Equipamento', 'Marketing', 'Outros'];

function TransactionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    description: '',
    type: 'income' as 'income' | 'expense',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Serviço',
    paymentMethod: 'Dinheiro',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.value || form.value === 0) return toast.error('Preencha descrição e valor');
    setSaving(true);
    try {
      await financialService.create({
        ...form,
        value: form.value,
        date: new Date(form.date + 'T12:00:00'),
        companyId,
      });
      toast.success('Transação registrada!');
      onSave();
      onClose();
    } catch {
      toast.error('Erro ao salvar transação');
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Nova Transação</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, type: 'income', category: 'Serviço' }))}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500'}`}
            >
              + Receita
            </button>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, type: 'expense', category: 'Produto' }))}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500'}`}
            >
              − Despesa
            </button>
          </div>
          <div>
            <label className="label">Descrição *</label>
            <input className="input" value={form.description} onChange={set('description')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Valor (R$) *</label>
              <CurrencyInput className="input" value={form.value} onChange={v => setForm(p => ({ ...p, value: v }))} />
            </div>
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Forma de Pagamento</label>
              <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
                {['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX', 'Transferência'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FinancialPage() {
  const { companyId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const data = await financialService.getByPeriod(companyId, start, end);
      setTransactions(data as Transaction[]);
    } catch {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedMonth]);

  useEffect(() => { load(); }, [load]);

  const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.value, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.value, 0);
  const profit = income - expenses;

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Fluxo de caixa e relatórios</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input w-auto"
          />
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Receitas</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(income)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Despesas</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profit >= 0 ? 'bg-sky-500' : 'bg-orange-500'}`}>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Lucro</p>
            <p className={`text-xl font-bold ${profit >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Transações</h2>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Pagamento</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td className="font-medium">{t.description}</td>
                    <td><span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t.category}</span></td>
                    <td>{t.paymentMethod ?? '—'}</td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {t.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '−'} {formatCurrency(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <TransactionModal onClose={() => setModal(false)} onSave={load} />
      )}
    </div>
  );
}
