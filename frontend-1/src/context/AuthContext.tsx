import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: 'supplier' | 'buyer' | 'transporter' | 'government';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'carbonloop_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      // Clear legacy permanent localStorage entry so reopening the website prompts sign-in first
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData: AuthUser) => {
    setUser(userData);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to persist auth state to sessionStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to clear auth state from storage', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
