import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Login } from '../features/auth/pages/Login';
import { useAuth } from '../contexts/AutoContext';

import { GerenciarUsuarios } from '../features/usuario/pages/GerenciarUsuarios';
const TelaPacientes = () => <h1 className="text-2xl font-bold">Módulo de Pacientes</h1>;

export function AppRoutes()
{
  const { usuario } = useAuth();
  if (!usuario) 
  {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/usuarios" replace />} />        
          <Route path="usuarios" element={<GerenciarUsuarios />} />
          <Route path="pacientes" element={<TelaPacientes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  );
}