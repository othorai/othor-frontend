// lib/config.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend-authorization-gatewa-alb-1180704430.eu-north-1.elb.amazonaws.com';

export const API_ENDPOINTS = {
  LOGIN: '/authorization/login',
  VERIFY: '/authorization/verify',
  ME: '/authorization/me',
  FORGOT_PASSWORD: '/authorization/forgot-password',
} as const;