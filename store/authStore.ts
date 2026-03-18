import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'INSTRUCTOR' | 'MANAGER' | 'ADMIN';
  departmentId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('cdl_token', token);
    localStorage.setItem('cdl_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('cdl_token');
    localStorage.removeItem('cdl_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cdl_token');
      const userStr = localStorage.getItem('cdl_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem('cdl_token');
          localStorage.removeItem('cdl_user');
        }
      }
    }
  },
}));