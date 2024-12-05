import Cookies from 'js-cookie';

interface AuthState {
  token: string;
  email: string;
  rememberMe: boolean;
}

export function saveAuthState(token: string, email: string, rememberMe: boolean): void {
  // Set both localStorage and cookie
  localStorage.setItem('authToken', token);
  Cookies.set('authToken', token, {
    expires: rememberMe ? 30 : 1, // 30 days if remember me, 1 day if not
    path: '/',
    sameSite: 'lax'
  });

  if (rememberMe) {
    localStorage.setItem('savedEmail', email);
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
  }
}

export function getAuthToken(): string | null {
  // Try localStorage first, then cookies
  return localStorage.getItem('authToken') || 
         Cookies.get('authToken') || 
         null;
}

export function clearAuthState(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('rememberMe');
  Cookies.remove('authToken', { path: '/' });
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Additional utility functions you might want to add
export function getSavedEmail(): string | null {
  return localStorage.getItem('savedEmail');
}

export function getRememberMeState(): boolean {
  return localStorage.getItem('rememberMe') === 'true';
}