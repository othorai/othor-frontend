const getApiUrl = () => {
  // For both server-side and client-side
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  return 'http://localhost:8004';
};

export const API_URL = getApiUrl();