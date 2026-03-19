'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDashboardStats } from '@/lib/firebase/firestore';
import { financialService, appointmentsService } from '@/lib/firebase/firestore';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import {
  Calendar, TrendingUp, Users, Car, DollarSign,
  Clock, CheckCircle, AlertCircle, Package, ArrowUpRight, ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { DashboardStats, Appointment, Transaction } from '@/types';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label, value, icon: Icon, color, change, prefix = '',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: number;
  prefix?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
          {prefix}{typeof value === 'number' && !prefix ? value.toLocaleString('pt-BR') : value}
        </p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(change)}% vs mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { companyId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [revenueData, setRevenueData] = useState<{ labels: string[]; income: number[]; expenses: number[] }>({
    labels: [],
    income: [],
    expenses: [],
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [s, appts] = await Promise.all([
        getDashboardStats(companyId),
        appointmentsService.getByDate(companyId, new Date()),
      ]);

      setStats(s as DashboardStats);
      setTodayAppointments(appts as Appointment[]);

      // Build 6-month revenue chart
      const now = new Date();
      const months: string[] = [];
      const income: number[] = [];
      const expenses: number[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        try {
          const summary = await financialService.getMonthSummary(
            companyId,
            d.getFullYear(),
            d.getMonth() + 1
          );
          income.push(summary.income);
          expenses.push(summary.expenses);
        } catch {
          income.push(0);
          expenses.push(0);
        }
      }
      setRevenueData({ labels: months, income, expenses });
    } catch (err) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    scales: {
      y: {
        ticks: {
          callback: (v: unknown) =>
            'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 }),
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={loadData} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 h-24 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Agendamentos Hoje"
            value={stats?.todayAppointments ?? 0}
            icon={Calendar}
            color="bg-sky-500"
          />
          <StatCard
            label="Em Andamento"
            value={stats?.inProgress ?? 0}
            icon={Clock}
            color="bg-amber-500"
          />
          <StatCard
            label="Concluídos Hoje"
            value={stats?.completedToday ?? 0}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            label="Faturamento Hoje"
            value={formatCurrency(stats?.todayRevenue ?? 0)}
            icon={DollarSign}
            color="bg-emerald-500"
          />
          <StatCard
            label="Faturamento Mês"
            value={formatCurrency(stats?.monthRevenue ?? 0)}
            icon={TrendingUp}
            color="bg-violet-500"
            change={12}
          />
          <StatCard
            label="Clientes Cadastrados"
            value={stats?.totalClients ?? 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            label="Veículos Atendidos"
            value={stats?.totalVehicles ?? 0}
            icon={Car}
            color="bg-cyan-500"
          />
          <StatCard
            label="Aguardando"
            value={stats?.pendingPayments ?? 0}
            icon={AlertCircle}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Receita vs Despesas (6 meses)
          </h2>
          <div className="h-64">
            <Bar
              data={{
                labels: revenueData.labels,
                datasets: [
                  {
                    label: 'Receita',
                    data: revenueData.income,
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    borderRadius: 6,
                  },
                  {
                    label: 'Despesas',
                    data: revenueData.expenses,
                    backgroundColor: 'rgba(249, 115, 22, 0.8)',
                    borderRadius: 6,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Services Distribution */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Serviços Mais Vendidos
          </h2>
          <div className="h-64">
            <Doughnut
              data={{
                labels: ['Lavagem', 'Polimento', 'Vitrificação', 'Higienização', 'Motor'],
                datasets: [
                  {
                    data: [35, 25, 18, 15, 7],
                    backgroundColor: [
                      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
                    ],
                    borderWidth: 2,
                    borderColor: 'transparent',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '65%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Agendamentos de Hoje
          </h2>
          <a href="/appointments" className="text-xs text-sky-500 hover:text-sky-600 font-medium">
            Ver todos →
          </a>
        </div>
        <div className="table-wrapper">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Nenhum agendamento para hoje
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Serviço</th>
                  <th>Funcionário</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="font-medium">{appt.time}</td>
                    <td>{appt.clientName ?? '—'}</td>
                    <td>
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {appt.vehiclePlate ?? '—'}
                      </span>
                    </td>
                    <td>{appt.serviceName ?? '—'}</td>
                    <td>{appt.employeeName ?? '—'}</td>
                    <td className="font-medium text-green-600 dark:text-green-400">
                      {appt.servicePrice ? formatCurrency(appt.servicePrice) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[appt.status]}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
