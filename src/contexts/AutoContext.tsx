import { createContext, useContext, useState,  } from 'react';
import type { Usuario } from '../features/usuario/types/usuario';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface AuthContextData {
  usuarioLogado: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode })
{
    
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(() => {
    const userStorage = localStorage.getItem('@ClinicaVR:usuario');
    if (userStorage) return JSON.parse(userStorage);
    return null;
  });

  async function login(email: string, senha: string)
  {
   try {
        const response = await api.post('/apis/usuario/logar', null, { params: { email, senha } });
        const usuarioLogado: Usuario = response.data;
        setUsuarioLogado(usuarioLogado);
        localStorage.setItem('@ClinicaVR:usuario', JSON.stringify(usuarioLogado));
    }
    catch(error)
    {
        throw new Error('E-mail ou Senha Incorreto(s)');
    }
    
  }

  function logout() {
    setUsuarioLogado(null);
    localStorage.removeItem('@ClinicaVR:usuario');
  }

  return (
    <AuthContext.Provider value={{ usuarioLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth()
{
  return useContext(AuthContext);
}