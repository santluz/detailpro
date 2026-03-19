'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { vehiclesService, clientsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Vehicle, Client } from '@/types';
import { Plus, Search, Car, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function VehicleModal({ vehicle, clients, onClose, onSave }: {
  vehicle?: Vehicle | null;
  clients: Client[];
  onClose: () => void;
  onSave: () => void;
}) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    clientId: vehicle?.clientId ?? '',
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    color: vehicle?.color ?? '',
    plate: vehicle?.plate ?? '',
    mileage: vehicle?.mileage ?? 0,
    notes: vehicle?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.brand || !form.plate) return toast.error('Preencha cliente, marca e placa');
    setSaving(true);
    try {
      const client = clients.find(c => c.id === form.clientId);
      const data = { ...form, companyId, clientName: client?.name, plate: form.plate.toUpperCase() };
      if (vehicle?.id) { await vehiclesService.update(vehicle.id, data); toast.success('Veículo atualizado!'); }
      else { await vehiclesService.create(data); toast.success('Veículo cadastrado!'); }
      onSave(); onClose();
    } catch { toast.error('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{vehicle ? 'Editar Veículo' : 'Novo Veículo'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Cliente *</label>
            <select className="input" value={form.clientId} onChange={set('clientId')} required>
              <option value="">Selecione o cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Marca *</label><input className="input" value={form.brand} onChange={set('brand')} placeholder="Toyota" required /></div>
            <div><label className="label">Modelo *</label><input className="input" value={form.model} onChange={set('model')} placeholder="Corolla" required /></div>
            <div><label className="label">Ano</label><input className="input" type="number" value={form.year} onChange={set('year')} /></div>
            <div><label className="label">Cor</label><input className="input" value={form.color} onChange={set('color')} placeholder="Prata" /></div>
            <div><label className="label">Placa *</label><input className="input" value={form.plate} onChange={set('plate')} placeholder="ABC1D23" required /></div>
            <div><label className="label">KM</label><input className="input" type="number" value={form.mileage} onChange={set('mileage')} /></div>
          </div>
          <div><label className="label">Observações</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} /></div>
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

export default function VehiclesPage() {
  const { companyId } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; vehicle?: Vehicle | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [v, c] = await Promise.all([vehiclesService.getAll(companyId), clientsService.getAll(companyId)]);
      setVehicles(v as Vehicle[]); setClients(c as Client[]);
    } catch { toast.error('Erro ao carregar veículos'); } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, plate: string) => {
    if (!confirm(`Excluir veículo ${plate}?`)) return;
    try { await vehiclesService.delete(id); toast.success('Veículo excluído'); load(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const filtered = vehicles.filter(v =>
    v.plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Veículos</h1><p className="page-subtitle">{vehicles.length} veículos cadastrados</p></div>
        <button onClick={() => setModal({ open: true })} className="btn-primary"><Plus className="w-4 h-4" />Novo Veículo</button>
      </div>
      <div className="card p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Buscar por placa, modelo, cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" /></div>
            : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Car className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum veículo encontrado</p>
              </div>
            ) : (
              <table className="table">
                <thead><tr><th>Placa</th><th>Veículo</th><th>Ano</th><th>Cor</th><th>Cliente</th><th>KM</th><th>Ações</th></tr></thead>
                <tbody>
                  {filtered.map(v => (
                    <tr key={v.id}>
                      <td><span className="font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{v.plate}</span></td>
                      <td className="font-medium">{v.brand} {v.model}</td>
                      <td>{v.year}</td>
                      <td>{v.color}</td>
                      <td>{v.clientName ?? '—'}</td>
                      <td>{v.mileage ? `${v.mileage.toLocaleString('pt-BR')} km` : '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setModal({ open: true, vehicle: v })} className="btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(v.id, v.plate)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
      {modal.open && <VehicleModal vehicle={modal.vehicle} clients={clients} onClose={() => setModal({ open: false })} onSave={load} />}
    </div>
  );
}
