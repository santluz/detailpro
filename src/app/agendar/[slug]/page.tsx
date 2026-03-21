'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDocs, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase/config';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, Car, User, Phone, ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Service { id: string; name: string; price: number; duration: number; description?: string; }
interface Company { id: string; name: string; logo?: string; phone?: string; settings?: { workingHours?: { start: string; end: string }; workingDays?: number[]; }; }

const STEPS = ['Serviço', 'Data & Hora', 'Seus Dados'];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    slots.push(`${Math.floor(cur/60).toString().padStart(2,'0')}:${(cur%60).toString().padStart(2,'0')}`);
    cur += duration;
  }
  return slots;
}

export default function AgendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', plate: '', notes: '' });

  useEffect(() => {
    async function load() {
      try {
        const compSnap = await getDocs(collection(db, 'companies'));
        const comp = compSnap.docs.find(d => {
          const name = (d.data().name || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return name === slug;
        });
        if (!comp) { setLoading(false); return; }
        setCompany({ id: comp.id, ...comp.data() } as Company);
        const svcSnap = await getDocs(query(collection(db, 'services'), where('companyId', '==', comp.id)));
        setServices(svcSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !selectedService || !company) return;
    const wh = company.settings?.workingHours || { start: '08:00', end: '18:00' };
    setSlots(generateSlots(wh.start, wh.end, selectedService.duration || 60));
    setSelectedTime('');
  }, [selectedDate, selectedService, company]);

  function getAvailableDates() {
    const wd = company?.settings?.workingDays ?? [1,2,3,4,5,6];
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 30 && dates.length < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (wd.includes(d.getDay())) dates.push(d);
    }
    return dates;
  }

  async function handleConfirm() {
    if (!company || !selectedService) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        companyId: company.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        clientName: form.name,
        clientPhone: form.phone,
        vehiclePlate: form.plate,
        notes: form.notes,
        date: new Date(`${selectedDate}T${selectedTime}`),
        time: selectedTime,
        status: 'scheduled',
        source: 'online',
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch { toast.error('Erro ao confirmar. Tente novamente.'); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center animate-pulse">
        <Zap className="w-8 h-8 text-white" />
      </div>
    </div>
  );

  if (!company) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-center">
      <div><p className="text-xl font-bold mb-2">Empresa não encontrada</p><p className="text-gray-400">Verifique o link e tente novamente.</p></div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Agendamento confirmado!</h2>
        <p className="text-gray-400 mb-6">Seu agendamento foi realizado com sucesso.</p>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 text-left space-y-3 mb-6">
          <div className="flex justify-between text-sm"><span className="text-gray-400">Serviço</span><span className="text-white font-medium">{selectedService?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Data</span><span className="text-white">{new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Horário</span><span className="text-white">{selectedTime}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Valor</span><span className="text-sky-400 font-bold">{formatCurrency(selectedService?.price || 0)}</span></div>
          {form.plate && <div className="flex justify-between text-sm"><span className="text-gray-400">Veículo</span><span className="text-white">{form.plate}</span></div>}
        </div>
        {company.phone && (
          <a href={`https://wa.me/55${company.phone.replace(/\D/g,'')}?text=Olá! Agendei um ${selectedService?.name} para ${new Date(selectedDate+'T12:00').toLocaleDateString('pt-BR')} às ${selectedTime}. Sou ${form.name}.`}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold flex items-center justify-center gap-2 transition-all mb-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.524 5.862L0 24l6.29-1.504A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.36-.214-3.733.893.933-3.648-.235-.374A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>
            Confirmar pelo WhatsApp
          </a>
        )}
        <button onClick={() => { setDone(false); setStep(0); setSelectedService(null); setSelectedDate(''); setSelectedTime(''); setForm({ name:'', phone:'', plate:'', notes:'' }); }}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-300">Fazer outro agendamento</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          {company.logo
            ? <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3" />
            : <div className="w-20 h-20 rounded-2xl bg-sky-500 flex items-center justify-center mx-auto mb-3"><Zap className="w-10 h-10 text-white" /></div>
          }
          <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Agendamento online</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-sky-400' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? 'bg-sky-500 border-sky-500 text-white' : i === step ? 'border-sky-400 text-sky-400' : 'border-gray-700 text-gray-600'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block">{s}</span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-sky-500' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4">Escolha o serviço</h2>
            {services.length === 0 && <div className="text-center py-12 text-gray-500">Nenhum serviço disponível.</div>}
            {services.map(svc => (
              <button key={svc.id} onClick={() => { setSelectedService(svc); setStep(1); }}
                className="w-full p-4 rounded-2xl border-2 border-gray-800 bg-gray-900 hover:border-gray-600 text-left transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{svc.name}</p>
                    {svc.description && <p className="text-sm text-gray-400 mt-0.5">{svc.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">⏱ {svc.duration || 60} min</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sky-400 font-bold text-lg">{formatCurrency(svc.price)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-auto mt-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Escolha a data</h2>
            <div className="grid grid-cols-4 gap-2">
              {getAvailableDates().map(d => {
                const val = d.toISOString().split('T')[0];
                return (
                  <button key={val} onClick={() => setSelectedDate(val)}
                    className={`p-3 rounded-xl text-center transition-all ${selectedDate === val ? 'bg-sky-500 text-white' : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-600'}`}>
                    <p className="text-xs capitalize">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                    <p className="text-xl font-bold">{d.getDate()}</p>
                    <p className="text-xs capitalize">{d.toLocaleDateString('pt-BR', { month: 'short' })}</p>
                  </button>
                );
              })}
            </div>
            {selectedDate && <>
              <h2 className="text-lg font-semibold text-white">Escolha o horário</h2>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedTime === t ? 'bg-sky-500 text-white' : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</button>
              <button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTime} className="flex-1 py-3 rounded-xl bg-sky-500 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2">Continuar <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Seus dados</h2>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-gray-400 flex items-center gap-2"><Zap className="w-4 h-4 text-sky-400" />{selectedService?.name}</span><span className="text-sky-400 font-bold">{formatCurrency(selectedService?.price||0)}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><Calendar className="w-4 h-4" />{new Date(selectedDate+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><Clock className="w-4 h-4" />{selectedTime}</div>
            </div>
            {[
              { label: 'Seu nome *', icon: User, key: 'name', placeholder: 'Nome completo', type: 'text' },
              { label: 'WhatsApp *', icon: Phone, key: 'phone', placeholder: '(11) 99999-9999', type: 'tel' },
              { label: 'Placa do veículo', icon: Car, key: 'plate', placeholder: 'ABC-1234', type: 'text' },
            ].map(({ label, icon: Icon, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={type} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder={placeholder} value={(form as Record<string,string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: key === 'plate' ? e.target.value.toUpperCase() : e.target.value }))} />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
              <textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 h-20 resize-none"
                placeholder="Alguma informação adicional..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</button>
              <button onClick={handleConfirm} disabled={!form.name || !form.phone || saving}
                className="flex-1 py-3 rounded-xl bg-sky-500 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? 'Confirmando...' : <><Check className="w-4 h-4" /> Confirmar</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
