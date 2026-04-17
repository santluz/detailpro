'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase/config';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Shield, Users, Building2, Ban, Trash2, CheckCircle,
  RefreshCw, Search, AlertTriangle,
} from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'esantluz@gmail.com';

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  createdAt: Date;
  userCount?: number;
  adminEmail?: string;
}

export default function AdminPage() {
  const { user, isAuthenticated, initialized } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Redirect if not super admin
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated || user?.email !== SUPER_ADMIN_EMAIL) {
      router.push('/dashboard');
    }
  }, [initialized, isAuthenticated, user, router]);

  const loadCompanies = useCallback(async () => {
    if (user?.email !== SUPER_ADMIN_EMAIL) return;
    setLoading(true);
    try {
      const companiesSnap = await getDocs(collection(db, 'companies'));
      const usersSnap = await getDocs(collection(db, 'users'));

      const companiesList = await Promise.all(companiesSnap.docs.map(async d => {
        const data = d.data();
        // Find admin user for this company
        const adminUser = usersSnap.docs
          .map(u => u.data())
          .find(u => u.companyId === d.id && u.role === 'admin');

        return {
          id: d.id,
          name: data.name || 'Sem nome',
          email: data.email || '',
          phone: data.phone || '',
          plan: data.plan || 'starter',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          userCount: usersSnap.docs.filter(u => u.data().companyId === d.id).length,
          adminEmail: adminUser?.email || '',
        } as CompanyData;
      }));

      setCompanies(companiesList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      toast.error('Erro ao carregar empresas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  async function handleToggleStatus(company: CompanyData) {
    const newStatus = company.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'bloquear' : 'reativar';
    if (!confirm(`Deseja ${action} a empresa "${company.name}"?`)) return;
    try {
      await updateDoc(doc(db, 'companies', company.id), { status: newStatus });
      toast.success(`Empresa ${newStatus === 'suspended' ? 'bloqueada' : 'reativada'}!`);
      loadCompanies();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  }

  async function handleDelete(company: CompanyData) {
    if (!confirm(`ATENÇÃO: Deletar permanentemente "${company.name}" e todos os seus dados?\n\nEssa ação não pode ser desfeita!`)) return;
    if (!confirm(`Confirme novamente: deletar "${company.name}"?`)) return;
    try {
      // Delete company document
      await deleteDoc(doc(db, 'companies', company.id));
      toast.success('Empresa deletada!');
      loadCompanies();
    } catch {
      toast.error('Erro ao deletar empresa');
    }
  }

  if (!initialized || user?.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-500">Acesso restrito</p>
        </div>
      </div>
    );
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.adminEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
    plans: {
      starter: companies.filter(c => c.plan === 'starter').length,
      professional: companies.filter(c => c.plan === 'professional').length,
      premium: companies.filter(c => c.plan === 'premium').length,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Painel Super Admin</h1>
            <p className="text-xs text-gray-500">Acesso exclusivo — {user?.email}</p>
          </div>
        </div>
        <button onClick={loadCompanies} disabled={loading} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Empresas', value: stats.total, icon: Building2, color: 'bg-sky-500' },
          { label: 'Ativas', value: stats.active, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Bloqueadas', value: stats.suspended, icon: Ban, color: 'bg-red-500' },
          { label: 'Usuários Totais', value: companies.reduce((s, c) => s + (c.userCount || 0), 0), icon: Users, color: 'bg-purple-500' },
        ].map(card => (
          <div key={card.label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Planos */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Starter', count: stats.plans.starter, price: 'R$97/mês', color: 'border-gray-200' },
          { label: 'Professional', count: stats.plans.professional, price: 'R$197/mês', color: 'border-sky-300' },
          { label: 'Premium', count: stats.plans.premium, price: 'R$297/mês', color: 'border-purple-300' },
        ].map(p => (
          <div key={p.label} className={`card p-4 border-2 ${p.color} text-center`}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{p.count}</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{p.label}</p>
            <p className="text-xs text-gray-400">{p.price}</p>
          </div>
        ))}
      </div>

      {/* Lista de empresas */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex-1">Empresas Cadastradas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9 text-sm w-64"
              placeholder="Buscar empresa ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma empresa encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(company => (
              <div key={company.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{company.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      company.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {company.status === 'active' ? 'Ativa' : 'Bloqueada'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 capitalize">
                      {company.plan}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Admin: {company.adminEmail || company.email} • {company.userCount} usuário(s)
                  </p>
                  <p className="text-xs text-gray-400">
                    ID: {company.id} • Criado em {company.createdAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(company)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      company.status === 'active'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {company.status === 'active'
                      ? <><Ban className="w-3.5 h-3.5" /> Bloquear</>
                      : <><CheckCircle className="w-3.5 h-3.5" /> Reativar</>
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
