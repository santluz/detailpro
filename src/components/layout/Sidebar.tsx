'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard, Users, Car, Wrench, Calendar, UserCircle,
  Package, DollarSign, BarChart3, Settings, ChevronLeft,
  ChevronRight, Zap, HelpCircle, LogOut,
} from 'lucide-react';
import { logoutUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/vehicles', label: 'Veículos', icon: Car },
  { href: '/services', label: 'Serviços', icon: Wrench },
  { href: '/appointments', label: 'Agenda', icon: Calendar },
  { href: '/employees', label: 'Funcionários', icon: UserCircle },
  { href: '/products', label: 'Estoque', icon: Package },
  { href: '/financial', label: 'Financeiro', icon: DollarSign },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Configurações', icon: Settings },
  { href: '/suporte', label: 'Suporte', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch {
      toast.error('Erro ao sair');
    }
  };

  return (
    <aside
      className={cn(
        'sidebar',
        !sidebarOpen && 'sidebar-collapsed'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">DetailPro</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="nav-item w-full justify-center mb-3"
            title="Expandir"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'nav-item-active')}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className="border-t border-gray-800 my-3" />

        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'nav-item-active')}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sky-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="nav-item w-full justify-center"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
