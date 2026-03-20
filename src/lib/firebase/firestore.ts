// ============================================================
// DETAILPRO SAAS - Firestore Service Layer
// ============================================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QueryConstraint,
  writeBatch,
  increment,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ============================================================
// COLLECTION NAMES
// ============================================================
export const COLLECTIONS = {
  COMPANIES: 'companies',
  USERS: 'users',
  CLIENTS: 'clients',
  VEHICLES: 'vehicles',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  EMPLOYEES: 'employees',
  PRODUCTS: 'products',
  FINANCIAL: 'financial',
  SUBSCRIPTIONS: 'subscriptions',
  LOGS: 'logs',
} as const;

// ============================================================
// HELPER: Convert Timestamps to Dates
// ============================================================
export function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const converted: Record<string, unknown> = { ...data };
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate();
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertTimestamps(converted[key] as Record<string, unknown>);
    }
  }
  return converted;
}

// ============================================================
// GENERIC CRUD OPERATIONS
// ============================================================

// CREATE
export async function createDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// READ ONE
export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...convertTimestamps(snap.data()) } as T;
}

// READ MANY
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...convertTimestamps(d.data()),
  })) as T[];
}

// UPDATE
export async function updateDocument<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// REAL-TIME LISTENER
export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): () => void {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...convertTimestamps(d.data()),
    })) as T[];
    callback(data);
  });
}

// ============================================================
// COMPANY-SCOPED QUERIES
// ============================================================
export function byCompany(companyId: string): QueryConstraint {
  return where('companyId', '==', companyId);
}

// ============================================================
// CLIENTS SERVICE
// ============================================================
export const clientsService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.CLIENTS, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.CLIENTS, [
      byCompany(companyId),
      orderBy('name'),
    ]);
  },
  async getById(id: string) {
    return getDocument(COLLECTIONS.CLIENTS, id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.CLIENTS, id, data);
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.CLIENTS, id);
  },
  subscribe(companyId: string, callback: (data: unknown[]) => void) {
    return subscribeToCollection(
      COLLECTIONS.CLIENTS,
      [byCompany(companyId), orderBy('name')],
      callback
    );
  },
};

// ============================================================
// VEHICLES SERVICE
// ============================================================
export const vehiclesService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.VEHICLES, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.VEHICLES, [byCompany(companyId)]);
  },
  async getByClient(companyId: string, clientId: string) {
    return getDocuments(COLLECTIONS.VEHICLES, [
      byCompany(companyId),
      where('clientId', '==', clientId),
    ]);
  },
  async getById(id: string) {
    return getDocument(COLLECTIONS.VEHICLES, id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.VEHICLES, id, data);
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.VEHICLES, id);
  },
};

// ============================================================
// SERVICES SERVICE
// ============================================================
export const servicesService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.SERVICES, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.SERVICES, [
      byCompany(companyId),
      where('active', '==', true),
      orderBy('name'),
    ]);
  },
  async getById(id: string) {
    return getDocument(COLLECTIONS.SERVICES, id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.SERVICES, id, data);
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.SERVICES, id);
  },
};

// ============================================================
// APPOINTMENTS SERVICE
// ============================================================
export const appointmentsService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.APPOINTMENTS, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.APPOINTMENTS, [
      byCompany(companyId),
      orderBy('date', 'desc'),
    ]);
  },
  async getByDate(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return getDocuments(COLLECTIONS.APPOINTMENTS, [
      byCompany(companyId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('date'),
    ]);
  },
  async getByStatus(companyId: string, status: string) {
    return getDocuments(COLLECTIONS.APPOINTMENTS, [
      byCompany(companyId),
      where('status', '==', status),
      orderBy('date', 'desc'),
    ]);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.APPOINTMENTS, id, data);
  },
  async updateStatus(id: string, status: string) {
    return updateDocument(COLLECTIONS.APPOINTMENTS, id, { status });
  },
  subscribe(companyId: string, callback: (data: unknown[]) => void) {
    return subscribeToCollection(
      COLLECTIONS.APPOINTMENTS,
      [byCompany(companyId), orderBy('date', 'desc'), limit(100)],
      callback
    );
  },
};

// ============================================================
// EMPLOYEES SERVICE
// ============================================================
export const employeesService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.EMPLOYEES, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.EMPLOYEES, [
      byCompany(companyId),
      where('status', '==', 'active'),
      orderBy('name'),
    ]);
  },
  async getById(id: string) {
    return getDocument(COLLECTIONS.EMPLOYEES, id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.EMPLOYEES, id, data);
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.EMPLOYEES, id);
  },
};

// ============================================================
// PRODUCTS SERVICE
// ============================================================
export const productsService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.PRODUCTS, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.PRODUCTS, [
      byCompany(companyId),
      orderBy('name'),
    ]);
  },
  async getLowStock(companyId: string) {
    return getDocuments(COLLECTIONS.PRODUCTS, [byCompany(companyId)]);
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.PRODUCTS, id, data);
  },
  async adjustStock(id: string, quantity: number) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      quantity: increment(quantity),
      updatedAt: serverTimestamp(),
    });
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.PRODUCTS, id);
  },
};

// ============================================================
// FINANCIAL SERVICE
// ============================================================
export const financialService = {
  async create(data: Record<string, unknown>) {
    return createDocument(COLLECTIONS.FINANCIAL, data);
  },
  async getAll(companyId: string) {
    return getDocuments(COLLECTIONS.FINANCIAL, [
      byCompany(companyId),
      orderBy('date', 'desc'),
    ]);
  },
  async getByPeriod(companyId: string, start: Date, end: Date) {
    return getDocuments(COLLECTIONS.FINANCIAL, [
      byCompany(companyId),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end)),
      orderBy('date', 'desc'),
    ]);
  },
  async getMonthSummary(companyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const transactions = await financialService.getByPeriod(companyId, start, end);
    let income = 0;
    let expenses = 0;
    (transactions as Array<{ type: string; value: number }>).forEach((t) => {
      if (t.type === 'income') income += t.value;
      else expenses += t.value;
    });
    return { income, expenses, profit: income - expenses };
  },
  async update(id: string, data: Record<string, unknown>) {
    return updateDocument(COLLECTIONS.FINANCIAL, id, data);
  },
  async delete(id: string) {
    return deleteDocument(COLLECTIONS.FINANCIAL, id);
  },
};

// ============================================================
// LOGS SERVICE
// ============================================================
export const logsService = {
  async create(data: {
    companyId: string;
    userId: string;
    userName?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }) {
    return createDocument(COLLECTIONS.LOGS, data);
  },
  async getRecent(companyId: string, limitCount = 50) {
    return getDocuments(COLLECTIONS.LOGS, [
      byCompany(companyId),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ]);
  },
};

// ============================================================
// DASHBOARD STATS
// ============================================================
export async function getDashboardStats(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Add 8s timeout to prevent infinite loading
  const withTimeout = <T>(promise: Promise<T>, fallback: T): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 8000)),
    ]);

  const [todayAppts, monthTransactions, clients, vehicles] = await Promise.all([
    withTimeout(appointmentsService.getByDate(companyId, today), []),
    withTimeout(financialService.getByPeriod(companyId, startOfMonth, endOfMonth), []),
    withTimeout(getDocuments(COLLECTIONS.CLIENTS, [byCompany(companyId)]), []),
    withTimeout(getDocuments(COLLECTIONS.VEHICLES, [byCompany(companyId)]), []),
  ]);

  const appts = todayAppts as Array<{ status: string; servicePrice?: number }>;
  const transactions = monthTransactions as Array<{ type: string; value: number; date: Date }>;

  const todayRevenue = transactions
    .filter((t) => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'income' && d >= today && d <= endOfToday;
    })
    .reduce((acc, t) => acc + t.value, 0);

  const monthRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.value, 0);

  return {
    todayAppointments: appts.length,
    inProgress: appts.filter((a) => a.status === 'in_progress').length,
    completedToday: appts.filter((a) => a.status === 'completed').length,
    todayRevenue,
    monthRevenue,
    totalClients: (clients as unknown[]).length,
    totalVehicles: (vehicles as unknown[]).length,
    pendingPayments: appts.filter((a) => a.status === 'scheduled').length,
    lowStockProducts: 0,
  };
}
