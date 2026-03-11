'use client';
export const dynamic = 'force-dynamic';
import { BarChart3 } from 'lucide-react';
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">Relatórios</h1></div>
      <div className="card p-12 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Módulo de relatórios em desenvolvimento</p>
      </div>
    </div>
  );
}
