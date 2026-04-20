export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}


export interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}
