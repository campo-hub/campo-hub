import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '../services/auth';
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  observeAuthState,
  signupWithEmail,
  updateUserProfile,
} from '../services/auth';
import { updateProfileBackend } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<AuthUser | null>;
  loginWithGoogle: () => Promise<AuthUser | null>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<AuthUser | null>;
  updateProfile: (name?: string, photoURL?: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleLoginWithEmail(email: string, password: string) {
    const nextUser = await loginWithEmail(email, password);
    setUser(nextUser);
    return nextUser;
  }

  async function handleSignupWithEmail(name: string, email: string, password: string) {
    const nextUser = await signupWithEmail(name, email, password);
    setUser(nextUser);
    return nextUser;
  }

  async function handleLoginWithGoogle() {
    const nextUser = await loginWithGoogle();
    setUser(nextUser);
    return nextUser;
  }

  async function handleUpdateProfile(name?: string, photoURL?: string) {
    const nextUser = await updateUserProfile(name, photoURL);
    if (nextUser) {
      try {
        await updateProfileBackend({ name, photoURL });
      } catch (e) {
        console.error('Failed to sync profile to backend:', e);
      }
    }
    setUser(nextUser);
    return nextUser;
  }

  async function handleLogout() {
    await logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail: handleLoginWithEmail,
        loginWithGoogle: handleLoginWithGoogle,
        signupWithEmail: handleSignupWithEmail,
        updateProfile: handleUpdateProfile,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
