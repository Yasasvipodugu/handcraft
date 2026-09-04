import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Artisan, UserRole } from '../types';
import { db } from '../services/database';
import { INITIAL_USERS } from '../data/initialSeedData';

interface AuthContextType {
  currentUser: User | null;
  currentArtisan: Artisan | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kala_current_user');
    return saved ? JSON.parse(saved) : db.getUserByEmail('artisan@demo.com') || null;
  });

  const [currentArtisan, setCurrentArtisan] = useState<Artisan | null>(null);

  const refreshUserData = () => {
    if (currentUser) {
      const freshUser = db.getUserById(currentUser.id);
      if (freshUser) {
        setCurrentUser(freshUser);
        localStorage.setItem('kala_current_user', JSON.stringify(freshUser));
        if (freshUser.role === 'artisan') {
          const artisan = db.getArtisanByUserId(freshUser.id);
          setCurrentArtisan(artisan || null);
        } else {
          setCurrentArtisan(null);
        }
      }
    }
  };

  useEffect(() => {
    refreshUserData();
    const unsub = db.subscribe('all', () => {
      refreshUserData();
    });
    return unsub;
  }, [currentUser?.id]);

  const login = async (email: string, _password?: string) => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid credentials. Please use demo accounts or register.' };
    }
    setCurrentUser(user);
    localStorage.setItem('kala_current_user', JSON.stringify(user));
    if (user.role === 'artisan') {
      const artisan = db.getArtisanByUserId(user.id);
      setCurrentArtisan(artisan || null);
    } else {
      setCurrentArtisan(null);
    }
    return { success: true };
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const existing = db.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser = db.createUser(userData);
    setCurrentUser(newUser);
    localStorage.setItem('kala_current_user', JSON.stringify(newUser));
    if (newUser.role === 'artisan') {
      const artisan = db.getArtisanByUserId(newUser.id);
      setCurrentArtisan(artisan || null);
    }
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentArtisan(null);
    localStorage.removeItem('kala_current_user');
  };

  const switchRole = (role: UserRole) => {
    const demoEmails: Record<UserRole, string> = {
      artisan: 'artisan@demo.com',
      customer: 'customer@demo.com',
      b2b_buyer: 'buyer@demo.com',
      admin: 'admin@demo.com'
    };
    let targetUser = db.getUserByEmail(demoEmails[role]);
    if (!targetUser) {
      const seedUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === demoEmails[role].toLowerCase());
      if (seedUser) {
        const allUsers = db.getUsers();
        allUsers.push(seedUser);
        localStorage.setItem('kala_users', JSON.stringify(allUsers));
        targetUser = seedUser;
      }
    }
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('kala_current_user', JSON.stringify(targetUser));
      if (role === 'artisan') {
        const artisan = db.getArtisanByUserId(targetUser.id);
        setCurrentArtisan(artisan || null);
      } else {
        setCurrentArtisan(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentArtisan,
        login,
        register,
        logout,
        switchRole,
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
