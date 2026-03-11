'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { productsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, AlertTriangle, Package, X, Loader2, Edit2, Trash2, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Limpeza', 'Polimento', 'Proteção', 'Embalagem', 'Ferramentas', 'Outros'];

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { companyId } = useAuth();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'Limpeza',
    quantity: product?.quantity ?? 0,
    minStock: product?.minStock ?? 5,
    unit: product?.unit ?? 'unidade',
    supplier: product?.supplier ?? '',
    purchasePrice: product?.purchasePrice ?? 0,
    salePrice: product?.salePrice ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error('Informe o nome do produto');
    setSaving(true);
    try {
      if (product?.id) {
        await productsService.update(product.id, { ...form });
        toast.success('Produto atualizado!');
      } else {
        await productsService.create({ ...form, companyId });
        toast.success('Produto cadastrado!');
      }
      onSave();
      onClose();
    } catch {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nome do produto *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unidade</label>
              <select className="input" value={form.unit} onChange={set('unit')}>
                {['unidade', 'litro', 'ml', 'kg', 'g', 'par', 'caixa'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantidade</label>
              <input className="input" type="number" min="0" value={form.quantity} onChange={set('quantity')} />
            </div>
            <div>
              <label className="label">Estoque Mínimo</label>
              <input className="input" type="number" min="0" value={form.minStock} onChange={set('minStock')} />
            </div>
            <div>
              <label className="label">Preço de Compra</label>
              <input className="input" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={set('purchasePrice')} />
            </div>
            <div>
              <label className="label">Preço de Venda</label>
              <input className="input" type="number" step="0.01" min="0" value={form.salePrice} onChange={set('salePrice')} />
            </div>
          </div>
          <div>
            <label className="label">Fornecedor</label>
            <input className="input" value={form.supplier} onChange={set('supplier')} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
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

export default function ProductsPage() {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await productsService.getAll(companyId);
      setProducts(data as Product[]);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const adjustStock = async (id: string, delta: number) => {
    try {
      await productsService.adjustStock(id, delta);
      load();
    } catch {
      toast.error('Erro ao ajustar estoque');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir produto "${name}"?`)) return;
    try {
      await productsService.delete(id);
      toast.success('Produto excluído');
      load();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">{products.length} produtos • {lowStockCount} com estoque baixo</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            {lowStockCount} produto(s) com estoque abaixo do mínimo
          </p>
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum produto encontrado</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Mínimo</th>
                  <th>P. Compra</th>
                  <th>P. Venda</th>
                  <th>Fornecedor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td><span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{p.category}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjustStock(p.id, -1)} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`font-bold w-8 text-center ${p.quantity <= p.minStock ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {p.quantity}
                        </span>
                        <button onClick={() => adjustStock(p.id, 1)} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Plus className="w-3 h-3" />
                        </button>
                        {p.quantity <= p.minStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                    </td>
                    <td>{p.minStock} {p.unit}</td>
                    <td>{formatCurrency(p.purchasePrice)}</td>
                    <td>{p.salePrice ? formatCurrency(p.salePrice) : '—'}</td>
                    <td>{p.supplier ?? '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ open: true, product: p })} className="btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
        <ProductModal product={modal.product} onClose={() => setModal({ open: false })} onSave={load} />
      )}
    </div>
  );
}
