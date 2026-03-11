'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Service, ServiceCategory } from '@/types';
import { formatCurrency, CATEGORY_LABELS, SERVICE_COLORS } from '@/lib/utils';
import { Plus, Wrench, Edit2, Trash2, X, Loader2, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES: ServiceCategory[] = ['lavagem','polimento','cristalizacao','vitrificacao','higienizacao','motor','outro'];

function ServiceModal({ service, onClose, onSave }: { service?: Service | null; onClose: () => void; onSave: () => void; }) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    name: service?.name ?? '', description: service?.description ?? '',
    duration: service?.duration ?? 60, price: service?.price ?? 0,
    category: service?.category ?? 'lavagem' as ServiceCategory, active: service?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error('Informe o nome do serviço');
    setSaving(true);
    try {
      if (service?.id) { await servicesService.update(service.id, { ...form }); toast.success('Serviço atualizado!'); }
      else { await servicesService.create({ ...form, companyId }); toast.success('Serviço cadastrado!'); }
      onSave(); onClose();
    } catch { toast.error('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{service ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="label">Nome *</label><input className="input" value={form.name} onChange={set('name')} required /></div>
          <div><label className="label">Descrição</label><textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div><label className="label">Duração (min)</label><input className="input" type="number" min="5" value={form.duration} onChange={set('duration')} /></div>
            <div><label className="label">Preço (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} /></div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-sky-500" />
              <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Serviço ativo</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { companyId } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; service?: Service | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try { const data = await servicesService.getAll(companyId); setServices(data as Service[]); }
    catch { toast.error('Erro ao carregar serviços'); } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir serviço "${name}"?`)) return;
    try { await servicesService.delete(id); toast.success('Serviço excluído'); load(); }
    catch { toast.error('Erro ao excluir'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Serviços</h1><p className="page-subtitle">{services.length} serviços cadastrados</p></div>
        <button onClick={() => setModal({ open: true })} className="btn-primary"><Plus className="w-4 h-4" />Novo Serviço</button>
      </div>
      {loading ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" /></div>
        : services.length === 0 ? (
          <div className="card p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum serviço cadastrado</p>
            <button onClick={() => setModal({ open: true })} className="btn-primary">Adicionar primeiro serviço</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.id} className="card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (SERVICE_COLORS[s.category] ?? '#6B7280') + '20' }}>
                      <Wrench className="w-5 h-5" style={{ color: SERVICE_COLORS[s.category] ?? '#6B7280' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</h3>
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[s.category]}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, service: s })} className="btn-ghost p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id, s.name)} className="btn-ghost p-1 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {s.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{s.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{s.duration} min</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400"><DollarSign className="w-3.5 h-3.5" />{formatCurrency(s.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      {modal.open && <ServiceModal service={modal.service} onClose={() => setModal({ open: false })} onSave={load} />}
    </div>
  );
}
