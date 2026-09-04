import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Artisan, UserRole } from '../types';
import { db } from '../services/database';
import { api } from '../services/api';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role: 'artisan' | 'customer' | 'b2b_buyer' | 'admin';
  location: string;
  craftType?: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentArtisan: Artisan | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('kala_current_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const isOldStock =
        parsed.avatar?.includes('photo-1544005313') || parsed.avatar?.includes('photo-1494790108377');
      const isDemo =
        parsed.id?.includes('demo') ||
        parsed.id === 'user-artisan-1' ||
        parsed.id === 'user-customer-1';
      if (isOldStock && !isDemo) {
        parsed.avatar = '';
        localStorage.setItem('kala_current_user', JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [currentArtisan, setCurrentArtisan] = useState<Artisan | null>(null);

  const refreshUserData = () => {
    if (currentUser) {
      const freshUser = db.getUserById(currentUser.id) || db.getUserByEmail(currentUser.email);
      if (freshUser) {
        setCurrentUser(freshUser);
        localStorage.setItem('kala_current_user', JSON.stringify(freshUser));
        if (freshUser.role === 'artisan') {
          const artisan = db.getArtisanByUserId(freshUser.id) || db.getArtisanById(`artisan-${freshUser.id}`);
          setCurrentArtisan(artisan || null);
        } else {
          setCurrentArtisan(null);
        }
      }
    } else {
      setCurrentArtisan(null);
    }
  };

  useEffect(() => {
    refreshUserData();
    const unsub = db.subscribe('all', () => {
      refreshUserData();
    });
    return unsub;
  }, [currentUser?.id]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('kala_current_user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('kala_auth_token', res.token);
      }

      if (res.user.role === 'artisan') {
        const artisan = db.getArtisanByUserId(res.user.id) || db.getArtisanById(`artisan-${res.user.id}`);
        setCurrentArtisan(artisan || null);
      } else {
        setCurrentArtisan(null);
      }
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Invalid email or password.' };
  };

  const register = async (userData: RegisterData) => {
    const res = await api.register(userData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('kala_current_user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('kala_auth_token', res.token);
      }

      if (res.user.role === 'artisan') {
        const artisan = db.getArtisanByUserId(res.user.id) || db.getArtisanById(`artisan-${res.user.id}`);
        setCurrentArtisan(artisan || null);
      } else {
        setCurrentArtisan(null);
      }
      return { success: true, user: res.user, message: res.message };
    }
    return { success: false, message: res.message || 'Registration failed.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentArtisan(null);
    localStorage.removeItem('kala_current_user');
    localStorage.removeItem('kala_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentArtisan,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
