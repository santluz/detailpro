'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/firebase/auth';
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha todos os campos');
    setLoading(true);
    try {
      await loginUser({ email, password });
      router.push('/dashboard');
    } catch {
      toast.error('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Toaster position="top-right" />
      {/* Left - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>DetailPro</div>
              <div style={{ fontSize: 12, color: '#888' }}>Gestão Automotiva</div>
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 4 }}>Bem-vindo de volta</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Faça login para acessar o painel</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                placeholder="seu@email.com" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Senha</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: '#0ea5e9' }}>Esqueceu a senha?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '8px 40px 8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: '10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#888', marginTop: 24 }}>
            Não tem conta?{' '}
            <Link href="/auth/register" style={{ color: '#0ea5e9', fontWeight: 500 }}>Criar conta grátis</Link>
          </p>
        </div>
      </div>

      {/* Right - Banner */}
      <div style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg, #0284c7, #1e40af)', alignItems: 'center', justifyContent: 'center', padding: '3rem' }} className="hidden lg:flex">
        <div style={{ color: 'white', textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>DetailPro SaaS</h2>
          <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32 }}>A plataforma completa para gestão da sua estética automotiva</p>
          {['✓ Agendamentos Inteligentes', '✓ Controle Financeiro', '✓ Gestão de Clientes', '✓ Histórico de Veículos', '✓ Relatórios Detalhados', '✓ App Multi-tenant'].map(f => (
            <div key={f} style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
