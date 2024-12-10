// context/auth-context-types.ts

export interface Organization {
    id: string;
    name: string;
    role: string;
  }
  
  export interface User {
    id: string;
    email: string;
    organizations?: Organization[];
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
  }