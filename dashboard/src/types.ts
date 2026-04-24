export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  adminRole?: {
    name: string;
    permissions: string[];
  };
}


export interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}
