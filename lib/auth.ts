import Cookies from 'js-cookie';

export function saveAuthState(token, email, rememberMe) {
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

export function getAuthToken() {
  // Try localStorage first, then cookies
  return localStorage.getItem('authToken') || 
         Cookies.get('authToken');
}

export function clearAuthState() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('rememberMe');
  Cookies.remove('authToken', { path: '/' });
}

export function isAuthenticated() {
  return !!getAuthToken();
}