'use client';
import Sidebar from "./Sidebar"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import { useAuth, useAuthProvider } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

function AuthGuard({ children }: { children: React.ReactNode }) {
  useAuthProvider();
  const { isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && initialized && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, initialized, isAuthenticated, router]);

  // Don't render anything until mounted on client
  if (!mounted) return null;

  if (!initialized || loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>D</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;

}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <Header />
        <main className={cn('transition-all duration-300 pt-16', sidebarOpen ? 'ml-[260px]' : 'ml-[72px]')}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
