// context/auth-context-types.tsx

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { saveAuthState, clearAuthState } from '@/lib/auth';
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
        setUser(null);
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
    clearAuthState();
    setUser(null);
    setLoading(false);
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      
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

      // Save auth state
      saveAuthState(data.access_token, email, rememberMe);
  
      // Fetch user data
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

      // Dispatch auth event after successful login and user data fetch
      console.log('Dispatching auth-state-changed event');
      window.dispatchEvent(new Event('auth-state-changed'));

      // Redirect if we have user data
      if (userData) {
        router.push('/home');
      } else {
        throw new Error('No user data received');
      }
  
    } catch (error) {
      handleLogout();
      throw error;
    } finally {
      setLoading(false);
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