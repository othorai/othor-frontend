'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_URL } from '@/lib/config';
import type { User, AuthContextType } from './auth-context-types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/authorization/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        
        // If we're on a login page and authenticated, redirect to home
        if (pathname?.includes('/login')) {
          router.push('/home');
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/authorization/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
  
      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received');
      }
  
      // Set token in both localStorage and cookie
      localStorage.setItem('authToken', data.access_token);
      document.cookie = `authToken=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
  
      // Fetch user data after successful login
      const userResponse = await fetch(`${API_URL}/authorization/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
  
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const userData = await userResponse.json();
      setUser(userData);
      
      // Use router for navigation
      router.push('/home');
      router.refresh();
  
    } catch (error) {
      handleLogout();
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      handleLogout();
      router.push('/login');
      router.refresh(); // Force a refresh of the navigation
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    loading
  };

  // Don't render children while loading
  if (loading) {
    return null; // Or a loading spinner component
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };