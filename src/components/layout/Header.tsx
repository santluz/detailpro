'use client';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { Search, Moon, Sun, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function Header() {
  const { sidebarOpen, darkMode, toggleDarkMode, globalSearch, setGlobalSearch, toggleSidebar } =
    useAppStore();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut: Ctrl+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 h-16 flex items-center gap-4 px-6',
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
        'transition-all duration-300',
        sidebarOpen ? 'left-[260px]' : 'left-[72px]'
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden btn-ghost"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Buscar clientes, veículos... (Ctrl+K)"
          className="input pl-9 pr-16 py-2 text-sm"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          <span>⌘K</span>
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="btn-ghost relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="btn-ghost"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
