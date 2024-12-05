// lib/config.ts

const getApiUrl = () => {
  // For server-side
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  return 'http://localhost:8004';
};

export const API_URL = getApiUrl();