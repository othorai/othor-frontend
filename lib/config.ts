// lib/config.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend-authorization-gatewa-alb-1180704430.eu-north-1.elb.amazonaws.com';

// Debug log the API URL
if (typeof window !== 'undefined') {
  console.log('API URL:', API_URL);
}