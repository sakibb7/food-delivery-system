import { useEffect, useState } from "react";
import axios from "axios";
import type { User } from "../types";
import { AppContext } from "./app-context";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  async function fetchUser() {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION_PATH}/user/me`, {
        withCredentials: true
      });

      console.log(data, "data");

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);



  return (
    <AppContext.Provider
      value={{
        isAuth,
        isLoading,
        setIsAuth,
        setIsLoading,
        setUser,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
