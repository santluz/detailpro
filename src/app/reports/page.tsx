'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { clientsService, appointmentsService, financialService, servicesService } from '@/lib/firebase/firestore';
import { formatCurrency } from '@/lib/utils';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign,
  Download, RefreshCw, Car, Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface Stats {
  totalClients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  avgTicket: number;
  topServices: { name: string; count: number; revenue: number }[];
  monthlyRevenue: number[];
  monthlyExpenses: number[];
  monthlyAppointments: number[];
  appointmentsByStatus: { scheduled: number; in_progress: number; completed: number; cancelled: number };
}

export default function ReportsPage() {
  const { companyId } = useAuth();
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const now = new Date();
      let start: Date;
      if (period === 'week') {
        start = new Date(now);
        start.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'quarter') {
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
      }

      const [clients, appointments, transactions, services] = await Promise.all([
        clientsService.getAll(companyId),
        appointmentsService.getAll(companyId),
        financialService.getByPeriod(companyId, start, now),
        servicesService.getAll(companyId),
      ]);

      const appts = appointments as Array<Record<string, unknown>>;
      const trans = transactions as Array<Record<string, unknown>>;

      // Filter appointments by period
      const filteredAppts = appts.filter(a => {
        const d = a.date instanceof Date ? a.date :
          (a.date && typeof (a.date as Record<string,unknown>).toDate === 'function')
            ? (a.date as { toDate: () => Date }).toDate()
            : new Date(a.date as string);
        return d >= start && d <= now;
      });

      // Revenue & expenses
      const totalRevenue = trans.filter(t => t.type === 'income').reduce((s, t) => s + (t.value as number), 0);
      const totalExpenses = trans.filter(t => t.type === 'expense').reduce((s, t) => s + (t.value as number), 0);

      // Appointments by status
      const byStatus = { scheduled: 0, in_progress: 0, completed: 0, cancelled: 0 };
      filteredAppts.forEach(a => {
        const status = a.status as string;
        if (status in byStatus) byStatus[status as keyof typeof byStatus]++;
      });

      // Top services
      const svcMap: Record<string, { count: number; revenue: number }> = {};
      filteredAppts.forEach(a => {
        const name = (a.serviceName as string) || 'Sem serviço';
        if (!svcMap[name]) svcMap[name] = { count: 0, revenue: 0 };
        svcMap[name].count++;
        svcMap[name].revenue += (a.servicePrice as number) || 0;
      });
      const topServices = Object.entries(svcMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Monthly data (last 6 months)
      const monthlyRevenue = Array(6).fill(0);
      const monthlyExpenses = Array(6).fill(0);
      const monthlyAppointments = Array(6).fill(0);
      const allTrans = await financialService.getByPeriod(
        companyId,
        new Date(now.getFullYear(), now.getMonth() - 5, 1),
        now
      ) as Array<Record<string, unknown>>;

      allTrans.forEach(t => {
        const d = t.date instanceof Date ? t.date :
          (t.date && typeof (t.date as Record<string,unknown>).toDate === 'function')
            ? (t.date as { toDate: () => Date }).toDate()
            : new Date(t.date as string);
        const diff = (now.getMonth() + 12 * now.getFullYear()) - (d.getMonth() + 12 * d.getFullYear());
        if (diff >= 0 && diff < 6) {
          const idx = 5 - diff;
          if (t.type === 'income') monthlyRevenue[idx] += t.value as number;
          else monthlyExpenses[idx] += t.value as number;
        }
      });

      appts.forEach(a => {
        const d = a.date instanceof Date ? a.date :
          (a.date && typeof (a.date as Record<string,unknown>).toDate === 'function')
            ? (a.date as { toDate: () => Date }).toDate()
            : new Date(a.date as string);
        const diff = (now.getMonth() + 12 * now.getFullYear()) - (d.getMonth() + 12 * d.getFullYear());
        if (diff >= 0 && diff < 6) monthlyAppointments[5 - diff]++;
      });

      const completed = byStatus.completed;
      setStats({
        totalClients: (clients as unknown[]).length,
        totalAppointments: filteredAppts.length,
        completedAppointments: completed,
        cancelledAppointments: byStatus.cancelled,
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        avgTicket: completed > 0 ? totalRevenue / completed : 0,
        topServices,
        monthlyRevenue,
        monthlyExpenses,
        monthlyAppointments,
        appointmentsByStatus: byStatus,
      });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, [companyId, period]);

  useEffect(() => { load(); }, [load]);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return MONTHS[d.getMonth()];
  });

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true, ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 11 } } } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Visão geral do negócio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input text-sm"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="week">Últimos 7 dias</option>
            <option value="month">Este mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Este ano</option>
          </select>
          <button onClick={load} disabled={loading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp, color: 'bg-green-500', sub: `Lucro: ${formatCurrency(stats?.profit || 0)}` },
          { label: 'Despesas', value: formatCurrency(stats?.totalExpenses || 0), icon: TrendingDown, color: 'bg-red-500', sub: 'No período' },
          { label: 'Agendamentos', value: stats?.totalAppointments || 0, icon: Calendar, color: 'bg-sky-500', sub: `${stats?.completedAppointments || 0} concluídos` },
          { label: 'Ticket Médio', value: formatCurrency(stats?.avgTicket || 0), icon: DollarSign, color: 'bg-purple-500', sub: 'Por serviço concluído' },
        ].map(card => (
          <div key={card.label} className="card p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Receita vs Despesas (6 meses)</h2>
          <div className="h-56">
            <Bar
              data={{
                labels: last6Months,
                datasets: [
                  { label: 'Receita', data: stats?.monthlyRevenue || [], backgroundColor: 'rgba(14,165,233,0.8)', borderRadius: 6 },
                  { label: 'Despesas', data: stats?.monthlyExpenses || [], backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6 },
                ],
              }}
              options={chartOpts}
            />
          </div>
        </div>

        {/* Status Doughnut */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status dos Agendamentos</h2>
          <div className="h-56">
            <Doughnut
              data={{
                labels: ['Agendado', 'Em Andamento', 'Concluído', 'Cancelado'],
                datasets: [{
                  data: [
                    stats?.appointmentsByStatus.scheduled || 0,
                    stats?.appointmentsByStatus.in_progress || 0,
                    stats?.appointmentsByStatus.completed || 0,
                    stats?.appointmentsByStatus.cancelled || 0,
                  ],
                  backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
                  borderWidth: 0,
                }],
              }}
              options={{ ...chartOpts, scales: undefined }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointments trend */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Agendamentos por Mês</h2>
          <div className="h-48">
            <Line
              data={{
                labels: last6Months,
                datasets: [{
                  label: 'Agendamentos',
                  data: stats?.monthlyAppointments || [],
                  borderColor: '#0ea5e9',
                  backgroundColor: 'rgba(14,165,233,0.1)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#0ea5e9',
                }],
              }}
              options={chartOpts}
            />
          </div>
        </div>

        {/* Top Services */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Serviços Mais Vendidos</h2>
          {!stats?.topServices.length ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-xs font-bold text-sky-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                      <span className="text-xs text-gray-500 ml-2">{s.count}x</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (s.count / (stats.topServices[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">
                    {formatCurrency(s.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Clientes', value: stats?.totalClients || 0, icon: Users, color: 'text-sky-500' },
          { label: 'Taxa de Conclusão', value: `${stats?.totalAppointments ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%`, icon: Calendar, color: 'text-green-500' },
          { label: 'Cancelamentos', value: stats?.cancelledAppointments || 0, icon: Car, color: 'text-red-500' },
          { label: 'Serviços Ativos', value: stats?.topServices.length || 0, icon: Wrench, color: 'text-purple-500' },
        ].map(card => (
          <div key={card.label} className="card p-4 text-center">
            <card.icon className={`w-6 h-6 ${card.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
