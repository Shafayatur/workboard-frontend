import { api } from './api';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';
import { User } from '@/types/user';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<LoginResponse>('/auth/login/', { email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  return data.user;
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}
