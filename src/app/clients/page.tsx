'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { clientsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Client } from '@/types';
import { formatPhone, formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus, Search, Phone, Mail, MessageCircle, Edit2, Trash2,
  Users, X, Loader2, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateWhatsAppLink } from '@/lib/utils';

// ============================================================
// CLIENT FORM MODAL
// ============================================================
function ClientModal({
  client,
  onClose,
  onSave,
}: {
  client?: Client | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    name: client?.name ?? '',
    phone: client?.phone ?? '',
    whatsapp: client?.whatsapp ?? '',
    email: client?.email ?? '',
    notes: client?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error('Nome e telefone são obrigatórios');
    setSaving(true);
    const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 8000));
    try {
      if (client?.id) {
        await Promise.race([clientsService.update(client.id, { ...form }), timeout]);
        toast.success('Cliente atualizado!');
      } else {
        await Promise.race([clientsService.create({ ...form, companyId, totalSpent: 0, totalServices: 0 }), timeout]);
        toast.success('Cliente cadastrado!');
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'timeout') {
        toast.success('Cliente salvo! (sincronizando...)');
        onSave(); onClose();
      } else { toast.error('Erro ao salvar cliente'); }
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefone *</label>
              <input className="input" value={form.phone} onChange={set('phone')} required />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={form.whatsapp} onChange={set('whatsapp')} />
            </div>
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// CLIENTS PAGE
// ============================================================
export default function ClientsPage() {
  const { companyId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; client?: Client | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await clientsService.getAll(companyId);
      setClients(data as Client[]);
    } catch {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir cliente "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await clientsService.delete(id);
      toast.success('Cliente excluído');
      load();
    } catch {
      toast.error('Erro ao excluir cliente');
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clients.length} clientes cadastrados</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Carregando clientes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              {!search && (
                <button onClick={() => setModal({ open: true })} className="btn-primary mt-4">
                  <Plus className="w-4 h-4" />
                  Adicionar primeiro cliente
                </button>
              )}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Serviços</th>
                  <th>Total Gasto</th>
                  <th>Último Serviço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{client.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{formatPhone(client.phone)}</span>
                        {client.whatsapp && (
                          <a
                            href={generateWhatsAppLink(client.whatsapp)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-500 hover:text-green-600"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      {client.email ? (
                        <a href={`mailto:${client.email}`} className="text-sky-500 hover:text-sky-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td>{client.totalServices ?? 0}</td>
                    <td className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(client.totalSpent ?? 0)}
                    </td>
                    <td className="text-gray-500">
                      {client.lastService ? formatDate(client.lastService) : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal({ open: true, client })}
                          className="btn-ghost p-1.5"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="btn-ghost p-1.5 hover:text-red-500"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal.open && (
        <ClientModal
          client={modal.client}
          onClose={() => setModal({ open: false })}
          onSave={load}
        />
      )}
    </div>
  );
}
