// ============================================================
// DETAILPRO SAAS - TypeScript Types
// ============================================================

export type UserRole = 'admin' | 'manager' | 'employee' | 'finance';
export type PlanType = 'starter' | 'professional' | 'premium';
export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TransactionType = 'income' | 'expense';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

// ============================================================
// COMPANY
// ============================================================
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string; // CNPJ
  address?: Address;
  logo?: string;
  plan: PlanType;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
  settings?: CompanySettings;
}

export interface CompanySettings {
  workingHours?: { start: string; end: string };
  workingDays?: number[];
  currency?: string;
  timezone?: string;
  notifications?: boolean;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// ============================================================
// USER
// ============================================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// ============================================================
// CLIENT
// ============================================================
export interface Client {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: Address;
  document?: string; // CPF
  birthDate?: Date;
  notes?: string;
  totalSpent?: number;
  totalServices?: number;
  lastService?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// VEHICLE
// ============================================================
export interface Vehicle {
  id: string;
  companyId: string;
  clientId: string;
  clientName?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  mileage?: number;
  fuel?: string;
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// SERVICE
// ============================================================
export interface Service {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  category: ServiceCategory;
  active: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceCategory =
  | 'lavagem'
  | 'polimento'
  | 'cristalizacao'
  | 'vitrificacao'
  | 'higienizacao'
  | 'motor'
  | 'outro';

// ============================================================
// APPOINTMENT
// ============================================================
export interface Appointment {
  id: string;
  companyId: string;
  clientId: string;
  clientName?: string;
  vehicleId: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  employeeId?: string;
  employeeName?: string;
  date: Date;
  time: string;
  duration?: number;
  status: AppointmentStatus;
  notes?: string;
  photos?: ServicePhoto[];
  totalValue?: number;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePhoto {
  url: string;
  type: 'before' | 'during' | 'after';
  uploadedAt: Date;
}

// ============================================================
// EMPLOYEE
// ============================================================
export interface Employee {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  salary?: number;
  commission?: number; // percentage
  document?: string;
  hireDate?: Date;
  status: 'active' | 'inactive';
  avatar?: string;
  productivity?: EmployeeProductivity;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeProductivity {
  totalServices: number;
  totalRevenue: number;
  averageRating?: number;
  completionRate?: number;
}

// ============================================================
// PRODUCT / STOCK
// ============================================================
export interface Product {
  id: string;
  companyId: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  supplier?: string;
  purchasePrice: number;
  salePrice?: number;
  notes?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// FINANCIAL
// ============================================================
export interface Transaction {
  id: string;
  companyId: string;
  description: string;
  type: TransactionType;
  value: number;
  date: Date;
  category: string;
  clientId?: string;
  clientName?: string;
  appointmentId?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// SUBSCRIPTION
// ============================================================
export interface Subscription {
  id: string;
  companyId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  price: number;
  renewalDate: Date;
  cancelledAt?: Date;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  maxClients: number;
  maxEmployees: number;
  maxAppointments: number;
  features: string[];
  highlighted?: boolean;
}

// ============================================================
// LOGS
// ============================================================
export interface ActivityLog {
  id: string;
  companyId: string;
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

// ============================================================
// DASHBOARD
// ============================================================
export interface DashboardStats {
  todayAppointments: number;
  inProgress: number;
  completedToday: number;
  todayRevenue: number;
  monthRevenue: number;
  totalClients: number;
  totalVehicles: number;
  pendingPayments: number;
  lowStockProducts: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
