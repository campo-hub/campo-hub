import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const BASE_URL = import.meta.env.VITE_API_BASE || '';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  role: 'student' | 'admin';
  photoURL?: string | null;
}

function normalizeUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  const email = user.email;
  const name = user.displayName || email?.split('@')[0] || 'Campus User';
  return {
    id: user.uid,
    email,
    name,
    role: 'student',
    photoURL: user.photoURL || null,
  };
}

async function fetchBackendProfile(user: FirebaseUser | null): Promise<AuthUser | null> {
  if (!user) return null;
  const token = await user.getIdToken(true);
  if (!token) return null;

  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return normalizeUser(user);
  }

  const data = await response.json();
  return {
    id: data.uid,
    email: data.email,
    name: data.name,
    role: data.role === 'admin' ? 'admin' : 'student',
    photoURL: data.photoURL || null,
  };
}

async function normalizeAndSyncUser(user: FirebaseUser | null): Promise<AuthUser | null> {
  const baseUser = normalizeUser(user);
  if (!user) return null;
  try {
    return await fetchBackendProfile(user);
  } catch {
    return baseUser;
  }
}

export async function signupWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (credential.user && name) {
    await updateProfile(credential.user, { displayName: name });
  }
  return normalizeAndSyncUser(credential.user);
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return normalizeAndSyncUser(credential.user);
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return normalizeAndSyncUser(credential.user);
}

export async function logoutUser() {
  await signOut(auth);
}

export async function updateUserProfile(name?: string, photoURL?: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user');
  }

  const updates: { displayName?: string; photoURL?: string } = {};
  if (name) updates.displayName = name;
  if (photoURL) updates.photoURL = photoURL;
  if (!Object.keys(updates).length) {
    return normalizeUser(currentUser);
  }

  await updateProfile(currentUser, updates);
  return normalizeUser(currentUser);
}

export function observeAuthState(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback(null);
      return;
    }

    normalizeAndSyncUser(user)
      .then(callback)
      .catch(() => callback(normalizeUser(user)));
  });
}

export async function getIdToken() {
  const currentUser = auth.currentUser;
  return currentUser ? currentUser.getIdToken(true) : null;
}
