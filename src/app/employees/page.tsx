'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Employee } from '@/types';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { Plus, UserCircle, Edit2, Trash2, X, Loader2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

function EmployeeModal({ employee, onClose, onSave }: { employee?: Employee | null; onClose: () => void; onSave: () => void; }) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    name: employee?.name ?? '', phone: employee?.phone ?? '', email: employee?.email ?? '',
    role: employee?.role ?? 'Detailer', salary: employee?.salary ?? 0,
    commission: employee?.commission ?? 0, status: employee?.status ?? 'active',
  });
  const [saving, setSaving] = useState(false);
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error('Nome e telefone obrigatórios');
    setSaving(true);
    try {
      if (employee?.id) { await employeesService.update(employee.id, { ...form }); toast.success('Funcionário atualizado!'); }
      else { await employeesService.create({ ...form, companyId }); toast.success('Funcionário cadastrado!'); }
      onSave(); onClose();
    } catch { toast.error('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="label">Nome *</label><input className="input" value={form.name} onChange={set('name')} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Telefone *</label><input className="input" value={form.phone} onChange={set('phone')} required /></div>
            <div><label className="label">E-mail</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
            <div><label className="label">Função</label>
              <select className="input" value={form.role} onChange={set('role')}>
                {['Detailer', 'Lavador', 'Polidor', 'Gerente', 'Recepcionista', 'Outro'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="active">Ativo</option><option value="inactive">Inativo</option>
              </select>
            </div>
            <div><label className="label">Salário (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.salary} onChange={set('salary')} /></div>
            <div><label className="label">Comissão (%)</label><input className="input" type="number" min="0" max="100" value={form.commission} onChange={set('commission')} /></div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { companyId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; employee?: Employee | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try { const data = await employeesService.getAll(companyId); setEmployees(data as Employee[]); }
    catch { toast.error('Erro ao carregar funcionários'); } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir funcionário "${name}"?`)) return;
    try { await employeesService.delete(id); toast.success('Funcionário excluído'); load(); }
    catch { toast.error('Erro ao excluir'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Funcionários</h1><p className="page-subtitle">{employees.length} funcionários ativos</p></div>
        <button onClick={() => setModal({ open: true })} className="btn-primary"><Plus className="w-4 h-4" />Novo Funcionário</button>
      </div>
      {loading ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" /></div>
        : employees.length === 0 ? (
          <div className="card p-12 text-center">
            <UserCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum funcionário cadastrado</p>
            <button onClick={() => setModal({ open: true })} className="btn-primary">Adicionar funcionário</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(e => (
              <div key={e.id} className="card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{e.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{e.name}</h3>
                      <span className="text-xs text-gray-500">{e.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, employee: e })} className="btn-ghost p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(e.id, e.name)} className="btn-ghost p-1 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" />{formatPhone(e.phone)}</div>
                  {e.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" />{e.email}</div>}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">{e.salary ? formatCurrency(e.salary) + '/mês' : '—'}</span>
                  {e.commission ? <span className="text-xs text-gray-500">{e.commission}% comissão</span> : null}
                  <span className={`badge ${e.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                    {e.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      {modal.open && <EmployeeModal employee={modal.employee} onClose={() => setModal({ open: false })} onSave={load} />}
    </div>
  );
}
