import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Id } from '../convex/_generated/dataModel';
import { useAuth, useCurrentUser } from '../lib/auth';

interface AuthContextType {
  userId: Id<'users'> | null;
  user: any;
  login: (email: string, name: string, avatar?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ID_KEY = '@fitbuddy:userId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<'users'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login: loginMutation } = useAuth();
  const user = useCurrentUser(userId);

  // Load stored user ID on mount
  useEffect(() => {
    loadStoredUserId();
  }, []);

  const loadStoredUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
      if (storedUserId) {
        setUserId(storedUserId as Id<'users'>);
      }
    } catch (error) {
      console.error('Error loading stored user ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, name: string, avatar?: string) => {
    try {
      const newUserId = await loginMutation(email, name, avatar);
      await AsyncStorage.setItem(USER_ID_KEY, newUserId);
      setUserId(newUserId);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);
      setUserId(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}





