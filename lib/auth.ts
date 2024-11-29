import { API_URL } from './config';
import Cookies from 'js-cookie';

export async function saveAuthState(token: string, email: string, rememberMe: boolean) {
  try {
    // Save token with explicit path and domain
    Cookies.set('authToken', token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: rememberMe ? 30 : undefined // 30 days if remember me is checked
    });

    // Also save in localStorage as backup
    localStorage.setItem('authToken', token);
    
    if (rememberMe) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('rememberMe');
    }

    return true;
  } catch (error) {
    console.error('Error saving auth state:', error);
    return false;
  }
}

export function getAuthToken(): string | null {
  try {
    // Try cookie first, then localStorage
    return Cookies.get('authToken') || localStorage.getItem('authToken') || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    console.log('Verifying token...');
    const response = await fetch(`${API_URL}/authorization/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Token verification response:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export function clearAuthState() {
  try {
    Cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}