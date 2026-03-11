'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCompanyWithAdmin } from '@/lib/firebase/auth';
import { Zap, Check, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 'R$ 97/mês', features: ['Até 100 clientes', '2 funcionários', 'Agendamentos', 'Relatórios básicos'] },
  { id: 'professional', name: 'Professional', price: 'R$ 197/mês', features: ['Até 500 clientes', '10 funcionários', 'Estoque', 'Financeiro completo'], highlight: true },
  { id: 'premium', name: 'Premium', price: 'R$ 297/mês', features: ['Clientes ilimitados', 'Funcionários ilimitados', 'API', 'Suporte prioritário'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({ name: '', email: '', phone: '' });
  const [admin, setAdmin] = useState({ name: '', email: '', password: '', confirm: '' });
  const [plan, setPlan] = useState('professional');

  useEffect(() => setMounted(true), []);

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
      else toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const s: React.CSSProperties = {
    minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 16, fontFamily: 'system-ui, sans-serif'
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white'
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 };
  const btn: React.CSSProperties = { padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' };

  return (
    <div style={s}>
      <Toaster position="top-right" />
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>DetailPro SaaS</span>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1,2,3].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > n ? '#22c55e' : step === n ? '#0ea5e9' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step >= n ? 'white' : '#9ca3af' }}>
                {step > n ? <Check size={14} /> : n}
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: step > n ? '#0ea5e9' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dados da Empresa</h2>
              <div><label style={lbl}>Nome da empresa *</label><input style={inp} placeholder="Auto Shine Estética" value={company.name} onChange={e => setCompany(p => ({...p, name: e.target.value}))} /></div>
              <div><label style={lbl}>E-mail *</label><input style={inp} type="email" placeholder="empresa@email.com" value={company.email} onChange={e => setCompany(p => ({...p, email: e.target.value}))} /></div>
              <div><label style={lbl}>Telefone *</label><input style={inp} placeholder="(11) 99999-9999" value={company.phone} onChange={e => setCompany(p => ({...p, phone: e.target.value}))} /></div>
              <button style={btn} onClick={() => { if (!company.name || !company.email || !company.phone) return toast.error('Preencha todos os campos'); setStep(2); }}>Continuar →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Conta do Administrador</h2>
              <div><label style={lbl}>Nome completo *</label><input style={inp} placeholder="Seu nome" value={admin.name} onChange={e => setAdmin(p => ({...p, name: e.target.value}))} /></div>
              <div><label style={lbl}>E-mail *</label><input style={inp} type="email" placeholder="admin@email.com" value={admin.email} onChange={e => setAdmin(p => ({...p, email: e.target.value}))} /></div>
              <div><label style={lbl}>Senha *</label><input style={inp} type="password" placeholder="Mínimo 6 caracteres" value={admin.password} onChange={e => setAdmin(p => ({...p, password: e.target.value}))} /></div>
              <div><label style={lbl}>Confirmar senha *</label><input style={inp} type="password" placeholder="Repita a senha" value={admin.confirm} onChange={e => setAdmin(p => ({...p, confirm: e.target.value}))} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{...btn, background: '#e5e7eb', color: '#374151'}} onClick={() => setStep(1)}>← Voltar</button>
                <button style={btn} onClick={() => { if (!admin.name || !admin.email || !admin.password) return toast.error('Preencha todos os campos'); setStep(3); }}>Continuar →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Escolha seu Plano</h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>14 dias grátis, sem cartão de crédito</p>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setPlan(p.id)} style={{ padding: 16, border: `2px solid ${plan === p.id ? '#0ea5e9' : '#e5e7eb'}`, borderRadius: 12, background: plan === p.id ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>{p.name} {p.highlight ? '⭐' : ''}</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{p.price}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {p.features.map(f => <span key={f} style={{ fontSize: 12, color: '#6b7280' }}>✓ {f}</span>)}
                  </div>
                </button>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{...btn, background: '#e5e7eb', color: '#374151'}} onClick={() => setStep(2)}>← Voltar</button>
                <button style={{ ...btn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={handleFinish}>
                  {loading && <Loader2 size={16} />}{loading ? 'Criando...' : 'Criar conta grátis'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 16 }}>
          Já tem conta? <Link href="/auth/login" style={{ color: '#0ea5e9', fontWeight: 500 }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
