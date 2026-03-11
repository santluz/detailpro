'use client';
export const dynamic = 'force-dynamic';
import { Settings } from 'lucide-react';
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">Configurações</h1></div>
      <div className="card p-12 text-center">
        <Settings className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Configurações em desenvolvimento</p>
      </div>
    </div>
  );
}
