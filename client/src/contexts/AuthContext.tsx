import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth as authApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authApi.login({ email, password });
    localStorage.setItem('token', token);
    setUser(u);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const { token, user: u } = await authApi.register(data);
    localStorage.setItem('token', token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
