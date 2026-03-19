'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('E-mail de recuperação enviado!');
      router.push('/auth/login');
    } catch {
      toast.error('Erro ao enviar e-mail. Verifique o endereço.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar senha</h1>
        <p className="text-gray-500 mb-6">Digite seu e-mail para receber o link de recuperação.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="input w-full"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando...' : 'Enviar e-mail'}
          </button>
          <button type="button" onClick={() => router.push('/auth/login')} className="w-full text-sm text-sky-500 hover:underline">
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  );
}
