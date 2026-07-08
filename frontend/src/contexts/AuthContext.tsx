import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Usuario {
  nome: string;
  email: string;
  perfil: string;
  avatar?: string | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  isAdmin: () => boolean;
  setAvatar: (avatar: string) => void; // Nova função adicionada
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
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

  const setAvatar = (novoAvatar: string) => {
    if (!usuario) return;
    const usuarioAtualizado = { ...usuario, avatar: novoAvatar };
    setUsuario(usuarioAtualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const isAdmin = () => usuario?.perfil === 'ADMIN';

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAdmin, setAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}