import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xweiwmvvhswtzxrfbetl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9lYzXwkMyz9o-p54Zwp0zA_PGZHptaO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface AppUser {
  id: string;
  email: string;
  role: 'SELLER' | 'BUYER' | 'TRANSPORTER' | 'GOVERNMENT_AGENT';
  organization: string;
  full_name: string;
}

const TOKEN_STORAGE_KEY = 'carbonloop_auth_token';
const USER_STORAGE_KEY = 'carbonloop_auth_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AppUser) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save auth state in localStorage', err);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear auth state from localStorage', err);
  }
}

/**
 * Returns active Bearer token for FastAPI endpoints:
 * Checks Supabase Auth session first, then falls back to stored demo/persistent token.
 */
export async function getAuthBearerToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch (err) {
    console.warn('Could not read Supabase session:', err);
  }
  return getStoredToken();
}
