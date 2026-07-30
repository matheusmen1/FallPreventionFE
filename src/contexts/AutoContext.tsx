import { createContext, useContext, useState,  } from 'react';
import type { Usuario } from '../features/usuario/types/usuario';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode })
{
    
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const userStorage = localStorage.getItem('@ClinicaVR:usuario');
    if (userStorage) return JSON.parse(userStorage);
    return null;
  });

  async function login(email: string, senha: string)
  {
   try {
        const response = await api.post('/apis/usuario/logar', null, { params: { email, senha } });
        const usuarioLogado: Usuario = response.data;
        setUsuario(usuarioLogado);
        localStorage.setItem('@ClinicaVR:usuario', JSON.stringify(usuarioLogado));
    }
    catch(error)
    {
        throw new Error('E-mail ou Senha Incorreto(s)');
    }
    
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem('@ClinicaVR:usuario');
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth()
{
  return useContext(AuthContext);
}