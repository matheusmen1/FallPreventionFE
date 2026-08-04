import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Login } from '../features/auth/pages/Login';
import { useAuth } from '../contexts/AutoContext';

import { GerenciarUsuarios } from '../features/usuario/pages/GerenciarUsuarios';
import { GerenciarPaciente } from '../features/paciente/pages/GerenciarPaciente';
import { GerenciarTipoExercicio } from '../features/tipoExercicio/pages/GerenciarTipoExercicio';
export function AppRoutes()
{
  const { usuarioLogado } = useAuth();
  if (!usuarioLogado) 
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
          <Route index element={<Navigate to="/pacientes" replace />} />
          {usuarioLogado.nivel === 1 &&
            <Route path="usuarios" element={<GerenciarUsuarios />} />
          }
          <Route path="pacientes" element={<GerenciarPaciente />} />
          <Route path="tipoExercicio" element={<GerenciarTipoExercicio/>}></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  );
}