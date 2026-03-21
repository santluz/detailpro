// ============================================================
// DETAILPRO SAAS - Authentication Service
// ============================================================
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore/lite';
import { auth, db } from './config';
import { COLLECTIONS } from './firestore';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyId: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================================
// REGISTER USER
// ============================================================
export async function registerUser(data: RegisterData) {
  const { name, email, password, companyId, role = 'admin' } = data;

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName: name });

  // Save user data in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    id: user.uid,
    name,
    email,
    role,
    companyId,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

// ============================================================
// LOGIN
// ============================================================
export async function loginUser({ email, password }: LoginData) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ============================================================
// LOGOUT
// ============================================================
export async function logoutUser() {
  await signOut(auth);
}

// ============================================================
// RESET PASSWORD
// ============================================================
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ============================================================
// GET USER DATA FROM FIRESTORE
// ============================================================
export async function getUserData(uid: string) {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ============================================================
// AUTH STATE LISTENER
// ============================================================
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================
// CREATE COMPANY + ADMIN USER
// ============================================================
export async function createCompanyWithAdmin(
  companyData: {
    name: string;
    email: string;
    phone: string;
    plan: string;
  },
  adminData: {
    name: string;
    email: string;
    password: string;
  }
) {
  // 1. Create company document
  const companyRef = doc(db, COLLECTIONS.COMPANIES, `${Date.now()}`);
  await setDoc(companyRef, {
    ...companyData,
    status: 'trial',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const companyId = companyRef.id;

  // 2. Create admin user
  const user = await registerUser({
    ...adminData,
    companyId,
    role: 'admin',
  });

  // 3. Create subscription
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 14); // 14-day trial

  await setDoc(doc(db, COLLECTIONS.SUBSCRIPTIONS, companyId), {
    companyId,
    plan: companyData.plan,
    status: 'trialing',
    price: 0,
    renewalDate,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { companyId, user };
}
