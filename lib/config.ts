const getApiUrl = () => {
  // For server-side
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  return 'http://backend-authorization-gatewa-alb-1180704430.eu-north-1.elb.amazonaws.com';
};

export const API_URL = getApiUrl();