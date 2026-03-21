'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { companiesService } from '@/lib/firebase/firestore';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Company } from '@/types';
import { formatPhone } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Building2, Phone, Mail, MapPin, Clock, Camera,
  Save, Globe, Shield, Bell, Palette, ChevronRight,
  User, Lock, CreditCard,
} from 'lucide-react';

const TABS = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'horarios', label: 'Horários', icon: Clock },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'conta', label: 'Minha Conta', icon: User },
];

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function SettingsPage() {
  const { companyId, user } = useAuth();
  const [tab, setTab] = useState('empresa');
  const [company, setCompany] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  // Form states
  const [form, setForm] = useState({
    name: '', email: '', phone: '', document: '',
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '',
    logo: '',
  });
  const [hours, setHours] = useState({ start: '08:00', end: '18:00' });
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5, 6]);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    companiesService.get(companyId).then((data) => {
      if (!data) return;
      const c = data as unknown as Company;
      setCompany(c);
      setForm({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        document: c.document || '',
        street: c.address?.street || '',
        number: c.address?.number || '',
        complement: c.address?.complement || '',
        neighborhood: c.address?.neighborhood || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        zipCode: c.address?.zipCode || '',
        logo: c.logo || '',
      });
      if (c.settings?.workingHours) setHours(c.settings.workingHours);
      if (c.settings?.workingDays) setWorkingDays(c.settings.workingDays);
      if (c.settings?.notifications !== undefined) setNotifications(c.settings.notifications);
    });
  }, [companyId]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx 2MB)'); return; }
    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `logos/${companyId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, logo: url }));
      await companiesService.update(companyId, { logo: url });
      toast.success('Logo atualizado!');
    } catch {
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSaveEmpresa() {
    if (!companyId) return;
    setSaving(true);
    try {
      await companiesService.update(companyId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        document: form.document,
        address: {
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      });
      toast.success('Dados salvos com sucesso!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHorarios() {
    if (!companyId) return;
    setSaving(true);
    try {
      await companiesService.update(companyId, {
        settings: { workingHours: hours, workingDays, notifications },
      });
      toast.success('Horários salvos!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: number) {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie as informações da sua empresa</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {tab !== t.id && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* EMPRESA */}
          {tab === 'empresa' && (
            <>
              {/* Logo */}
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-500" /> Logo da Empresa
                </h2>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                    {form.logo
                      ? <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                      : <Building2 className="w-8 h-8 text-gray-400" />
                    }
                  </div>
                  <div>
                    <button
                      onClick={() => logoRef.current?.click()}
                      disabled={uploadingLogo}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {uploadingLogo ? 'Enviando...' : 'Alterar logo'}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">PNG ou JPG, máx 2MB. Recomendado: 200x200px</p>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                </div>
              </div>

              {/* Dados básicos */}
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-500" /> Dados da Empresa
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da empresa *</label>
                    <input className="input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Auto Estética Silva" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input className="input w-full pl-9" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@empresa.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input className="input w-full pl-9" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ / CPF</label>
                    <input className="input w-full" value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))} placeholder="00.000.000/0000-00" />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-500" /> Endereço
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                    <input className="input w-full" value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="00000-000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rua</label>
                    <input className="input w-full" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="Nome da rua" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                    <input className="input w-full" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="123" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complemento</label>
                    <input className="input w-full" value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} placeholder="Sala, andar..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
                    <input className="input w-full" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                    <input className="input w-full" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Cidade" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select className="input w-full" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                      <option value="">Selecione</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveEmpresa} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </>
          )}

          {/* HORÁRIOS */}
          {tab === 'horarios' && (
            <>
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-500" /> Horário de Funcionamento
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abertura</label>
                    <input type="time" className="input w-full" value={hours.start} onChange={e => setHours(h => ({ ...h, start: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fechamento</label>
                    <input type="time" className="input w-full" value={hours.end} onChange={e => setHours(h => ({ ...h, end: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dias de funcionamento</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${
                          workingDays.includes(i)
                            ? 'bg-sky-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveHorarios} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar horários'}
                </button>
              </div>
            </>
          )}

          {/* NOTIFICAÇÕES */}
          {tab === 'notificacoes' && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-500" /> Notificações
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Novo agendamento', sub: 'Receber alerta quando um novo agendamento for criado', key: 'newAppt' },
                  { label: 'Lembrete de agendamento', sub: 'Notificar cliente 24h antes do serviço', key: 'reminder' },
                  { label: 'Estoque baixo', sub: 'Alertar quando produto atingir estoque mínimo', key: 'stock' },
                  { label: 'Pagamento recebido', sub: 'Confirmar quando uma transação for registrada', key: 'payment' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(n => !n)}
                      className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveHorarios} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar preferências'}
                </button>
              </div>
            </div>
          )}

          {/* CONTA */}
          {tab === 'conta' && (
            <>
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-500" /> Meus Dados
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input className="input w-full" defaultValue={user?.name || ''} disabled />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <input className="input w-full" defaultValue={user?.email || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                    <input className="input w-full capitalize" defaultValue={user?.role || ''} disabled />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-500" /> Segurança
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Para alterar sua senha, use a opção "Esqueceu a senha?" na tela de login.</p>
                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
                  <p className="text-sm text-sky-700 dark:text-sky-300">
                    🔒 Sua conta está protegida com autenticação Firebase. Para redefinir sua senha, acesse a tela de login e clique em "Esqueceu a senha?".
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-500" /> Plano Atual
                </h2>
                <div className="flex items-center justify-between mt-3 p-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white">
                  <div>
                    <p className="font-bold text-lg capitalize">{company.plan || 'Starter'}</p>
                    <p className="text-sky-100 text-sm">14 dias de teste gratuito</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {company.plan === 'professional' ? 'R$197' : company.plan === 'premium' ? 'R$297' : 'R$97'}
                    </p>
                    <p className="text-sky-100 text-sm">/mês</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
