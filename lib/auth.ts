// lib/auth.ts
import { API_URL } from './config';
import Cookies from 'js-cookie';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function saveAuthState(token: string, email: string, rememberMe: boolean) {
  // Save token in both localStorage and cookies for better security
  localStorage.setItem('authToken', token);
  Cookies.set('authToken', token, { path: '/' });
  
  if (rememberMe) {
    localStorage.setItem('savedEmail', email);
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
  }
}

export function getStoredAuthState() {
  const token = localStorage.getItem('authToken') || Cookies.get('authToken');
  const savedEmail = localStorage.getItem('savedEmail');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';

  return {
    token,
    savedEmail,
    rememberMe,
  };
}

export function clearAuthState() {
  localStorage.removeItem('authToken');
  Cookies.remove('authToken', { path: '/' });
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('rememberMe');
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/authorization/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken') || Cookies.get('authToken') || null;
}