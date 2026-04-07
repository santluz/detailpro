'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCompanyWithAdmin } from '@/lib/firebase/auth';
import { Zap, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 'R$ 97/mês', features: ['Até 100 clientes', '2 funcionários', 'Agendamentos', 'Relatórios básicos'] },
  { id: 'professional', name: 'Professional ⭐', price: 'R$ 197/mês', features: ['Até 500 clientes', '10 funcionários', 'Estoque', 'Financeiro completo'], highlight: true },
  { id: 'premium', name: 'Premium', price: 'R$ 297/mês', features: ['Clientes ilimitados', 'Funcionários ilimitados', 'API', 'Suporte prioritário'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({ name: '', email: '', phone: '' });
  const [admin, setAdmin] = useState({ name: '', email: '', password: '', confirm: '' });
  const [plan, setPlan] = useState('professional');

  const handleFinish = async () => {
    if (admin.password !== admin.confirm) return toast.error('As senhas não coincidem');
    if (admin.password.length < 6) return toast.error('Senha mínimo 6 caracteres');
    setLoading(true);
    try {
      await createCompanyWithAdmin(
        { name: company.name, email: company.email, phone: company.phone, plan },
        { name: admin.name, email: admin.email, password: admin.password }
      );
      toast.success('Conta criada! Redirecionando...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) toast.error('E-mail já cadastrado');
      else toast.error('Erro ao criar conta: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">DetailPro SaaS</span>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > n ? 'bg-green-500 text-white' : step === n ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > n ? <Check className="w-4 h-4" /> : n}
              </div>
              {i < 2 && <div className={`w-10 h-0.5 ${step > n ? 'bg-sky-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

          {/* Step 1 - Empresa */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Dados da Empresa</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da empresa *</label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Auto Shine Estética"
                  value={company.name}
                  onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="empresa@email.com"
                  value={company.email}
                  onChange={e => setCompany(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  value={company.phone}
                  onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <button
                onClick={() => { if (!company.name || !company.email || !company.phone) return toast.error('Preencha todos os campos'); setStep(2); }}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 2 - Admin */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Conta do Administrador</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Seu nome"
                  value={admin.name}
                  onChange={e => setAdmin(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="admin@email.com"
                  value={admin.email}
                  onChange={e => setAdmin(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                <input
                  type="password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  value={admin.password}
                  onChange={e => setAdmin(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha *</label>
                <input
                  type="password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Repita a senha"
                  value={admin.confirm}
                  onChange={e => setAdmin(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={() => { if (!admin.name || !admin.email || !admin.password) return toast.error('Preencha todos os campos'); setStep(3); }}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Plano */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Escolha seu Plano</h2>
                <p className="text-sm text-gray-500 mt-1">14 dias grátis, sem cartão de crédito</p>
              </div>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setPlan(p.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${plan === p.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-900">{p.name}</span>
                    <span className="text-sky-500 font-bold">{p.price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {p.features.map(f => <span key={f} className="text-xs text-gray-500">✓ {f}</span>)}
                  </div>
                </button>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
                  ← Voltar
                </button>
                <button onClick={handleFinish} disabled={loading}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Criando...' : 'Criar conta grátis'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-sky-500 font-medium hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
