import { create } from 'zustand';

interface User {
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (username, email) => set({ user: { username, email }, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));