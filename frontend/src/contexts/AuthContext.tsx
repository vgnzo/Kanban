import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Usuario {
  nome: string;
  email: string;
  perfil: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  const login = (novoToken: string, novoUsuario: Usuario) => {
    setToken(novoToken);
    setUsuario(novoUsuario);
    localStorage.setItem('token', novoToken);
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const isAdmin = () => usuario?.perfil === 'ADMIN';

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}