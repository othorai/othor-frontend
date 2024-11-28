// lib/auth.ts
import { API_URL } from './config';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthError {
  detail: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/authorization/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed. Please check your credentials and try again.');
  }

  return data;
}

export async function saveAuthState(token: string, email: string, rememberMe: boolean) {
  localStorage.setItem('authToken', token);
  
  if (rememberMe) {
    localStorage.setItem('savedEmail', email);
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
  }
}

export function getStoredAuthState() {
  const token = localStorage.getItem('authToken');
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
}