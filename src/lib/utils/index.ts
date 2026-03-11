import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string, fmt = 'dd/MM/yyyy'): string {
  const d = date instanceof Date ? date : new Date(date);
  return format(d, fmt, { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário',
  finance: 'Financeiro',
};

export const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  premium: 'Premium',
};

export const CATEGORY_LABELS: Record<string, string> = {
  lavagem: 'Lavagem',
  polimento: 'Polimento',
  cristalizacao: 'Cristalização',
  vitrificacao: 'Vitrificação',
  higienizacao: 'Higienização Interna',
  motor: 'Limpeza de Motor',
  outro: 'Outro',
};

export const SERVICE_COLORS: Record<string, string> = {
  lavagem: '#3B82F6',
  polimento: '#8B5CF6',
  cristalizacao: '#06B6D4',
  vitrificacao: '#10B981',
  higienizacao: '#F59E0B',
  motor: '#EF4444',
  outro: '#6B7280',
};

export function generateWhatsAppLink(phone: string, message = ''): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
