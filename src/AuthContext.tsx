import { createContext, useContext, useState, ReactNode } from "react";

type Auth = {
  apiKey: string | null;
  login: (key: string) => void;
  logout: () => void;
};

const AuthContext = createContext<Auth | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem("janus_api_key")
  );

  const login = (key: string) => {
    localStorage.setItem("janus_api_key", key);
    setApiKey(key);
  };

  const logout = () => {
    localStorage.removeItem("janus_api_key");
    setApiKey(null);
  };

  return (
    <AuthContext.Provider value={{ apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
