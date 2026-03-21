'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PhoneInput } from '@/components/ui/PhoneInput';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { appointmentsService, clientsService, vehiclesService, servicesService, employeesService } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Appointment, Client, Vehicle, Service, Employee } from '@/types';
import { formatCurrency, STATUS_COLORS, STATUS_LABELS, SERVICE_COLORS } from '@/lib/utils';
import { Plus, X, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// APPOINTMENT MODAL
// ============================================================
function AppointmentModal({
  clients,
  services,
  employees,
  appointment,
  onClose,
  onSave,
}: {
  clients: Client[];
  services: Service[];
  employees: Employee[];
  appointment?: Appointment | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { companyId } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    clientId: appointment?.clientId ?? '',
    vehicleId: appointment?.vehicleId ?? '',
    serviceId: appointment?.serviceId ?? '',
    employeeId: appointment?.employeeId ?? '',
    date: appointment?.date
      ? (appointment.date instanceof Date ? appointment.date : new Date(appointment.date)).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    time: appointment?.time ?? '08:00',
    status: appointment?.status ?? 'scheduled',
    notes: appointment?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.clientId && companyId) {
      vehiclesService.getByClient(companyId, form.clientId).then((v) => setVehicles(v as Vehicle[]));
    } else {
      setVehicles([]);
    }
  }, [form.clientId, companyId]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.vehicleId || !form.serviceId) {
      return toast.error('Preencha cliente, veículo e serviço');
    }
    setSaving(true);
    const _t = new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 8000));
    try {
      const client = clients.find((c) => c.id === form.clientId);
      const vehicle = vehicles.find((v) => v.id === form.vehicleId);
      const service = services.find((s) => s.id === form.serviceId);
      const employee = employees.find((e) => e.id === form.employeeId);

      const data = {
        ...form,
        companyId,
        clientName: client?.name,
        vehiclePlate: vehicle?.plate,
        vehicleModel: `${vehicle?.brand} ${vehicle?.model}`,
        serviceName: service?.name,
        servicePrice: service?.price,
        employeeName: employee?.name,
        date: new Date(form.date + 'T12:00:00'),
      };

      if (appointment?.id) {
        await Promise.race([appointmentsService.update(appointment.id, data), _t]);
        toast.success('Agendamento atualizado!');
      } else {
        await Promise.race([appointmentsService.create(data), _t]);
        toast.success('Agendamento criado!');
      }
      onSave();
      onClose();
    } catch {
      toast.error('Erro ao salvar agendamento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Cliente *</label>
              <select className="input" value={form.clientId} onChange={set('clientId')} required>
                <option value="">Selecione o cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Veículo *</label>
              <select className="input" value={form.vehicleId} onChange={set('vehicleId')} required disabled={!form.clientId}>
                <option value="">Selecione o veículo</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Serviço *</label>
              <select className="input" value={form.serviceId} onChange={set('serviceId')} required>
                <option value="">Selecione o serviço</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name} – {formatCurrency(s.price)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Funcionário</label>
              <select className="input" value={form.employeeId} onChange={set('employeeId')}>
                <option value="">Sem designação</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="scheduled">Agendado</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div>
              <label className="label">Horário *</label>
              <input className="input" type="time" value={form.time} onChange={set('time')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Observações</label>
              <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
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

// ============================================================
// APPOINTMENTS PAGE
// ============================================================
export default function AppointmentsPage() {
  const { companyId } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; appointment?: Appointment | null }>({ open: false });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [appts, c, s, e] = await Promise.all([
        appointmentsService.getAll(companyId),
        clientsService.getAll(companyId),
        servicesService.getAll(companyId),
        employeesService.getAll(companyId),
      ]);
      setAppointments(appts as Appointment[]);
      setClients(c as Client[]);
      setServices(s as Service[]);
      setEmployees(e as Employee[]);
    } catch {
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const calendarEvents = appointments.map((a) => ({
    id: a.id,
    title: `${a.time} • ${a.clientName ?? 'Cliente'} – ${a.serviceName ?? 'Serviço'}`,
    date: a.date instanceof Date ? a.date.toISOString().split('T')[0] : new Date(a.date as unknown as string).toISOString().split('T')[0],
    backgroundColor: STATUS_COLORS[a.status]?.includes('blue')
      ? '#3B82F6'
      : STATUS_COLORS[a.status]?.includes('yellow')
      ? '#F59E0B'
      : STATUS_COLORS[a.status]?.includes('green')
      ? '#10B981'
      : '#EF4444',
    borderColor: 'transparent',
    extendedProps: { appointment: a },
  }));

  const handleEventClick = (info: { event: { extendedProps: Record<string, unknown> } }) => {
    setModal({ open: true, appointment: info.event.extendedProps.appointment as Appointment });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">{appointments.length} agendamentos</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            locale={ptBrLocale}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
          />
        )}
      </div>

      {modal.open && (
        <AppointmentModal
          clients={clients}
          services={services}
          employees={employees}
          appointment={modal.appointment}
          onClose={() => setModal({ open: false })}
          onSave={load}
        />
      )}
    </div>
  );
}
