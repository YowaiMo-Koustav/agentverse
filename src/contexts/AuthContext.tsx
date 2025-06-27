'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, signature: string, message: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user data
    const token = localStorage.getItem('agentverse_token');
    const userData = localStorage.getItem('agentverse_user');
    console.log('AuthContext restore:', { token, userData });
    if (token && userData) {
      try {
        apiClient.setToken(token);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('agentverse_token');
        localStorage.removeItem('agentverse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (walletAddress: string, signature: string, message: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(walletAddress, signature, message);
      console.log('AuthContext login response:', response);
      if (response.error) {
        console.error('Login failed:', response.error);
        toast.error('Login failed: ' + response.error);
        return false;
      }
      if (response.data) {
        // Handle nested user response structure
        const responseData = response.data as any;
        const userData = responseData.user || responseData;
        const token = responseData.access_token || responseData.token;
        
        setUser(userData);
        if (token) {
          apiClient.setToken(token);
          localStorage.setItem('agentverse_token', token);
        }
        localStorage.setItem('agentverse_user', JSON.stringify(userData));
        console.log('AuthContext login: set user and localStorage', { token, user: userData });
        return true;
      }
      toast.error('Login failed: No user data');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login error: ' + (error instanceof Error ? error.message : error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.clearToken();
    localStorage.removeItem('agentverse_token');
    localStorage.removeItem('agentverse_user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const walletAddress = user.walletAddress;
      const response = await apiClient.updateUser(walletAddress, updates);
      console.log('AuthContext updateUser response:', response);
      if (response.error) {
        toast.error('Profile update failed: ' + response.error);
        return;
      }
      if (response.data) {
        // Fetch the latest user from backend to ensure username is present
        const fresh = await apiClient.getUser(walletAddress);
        if (fresh.data) {
          setUser(fresh.data);
          localStorage.setItem('agentverse_user', JSON.stringify(fresh.data));
          console.log('AuthContext updateUser: set user and localStorage', { user: fresh.data });
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Profile update error: ' + (error instanceof Error ? error.message : error));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 