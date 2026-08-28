import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Login } from '../features/auth/pages/Login';
import { useAuth } from '../contexts/AutoContext';

import { GerenciarUsuarios } from '../features/usuario/pages/GerenciarUsuarios';
import { GerenciarPaciente } from '../features/paciente/pages/GerenciarPaciente';
import { GerenciarTipoExercicio } from '../features/tipoExercicio/pages/GerenciarTipoExercicio';
import { GerenciarExercicio } from '../features/exercicio/pages/GerenciarExercicio';
import { GerenciarSessao } from '../features/sessao/pages/GerenciarSessao';
import { AprovacaoSessao } from '../features/sessao/pages/AprovacaoSessao';
import { Atendimento } from '../features/sessao/pages/Atendimento';
import { ExecucaoSessao } from '../features/sessao/pages/ExecucaoSessao';
import { RelatorioObservacoes } from '../features/sessao/pages/RelatorioObservacoes';
import { MeusDados } from '../features/usuario/components/MeusDados';
import { RelatorioGravacoes } from '../features/sessao/pages/RelatorioGravacoes';
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
          <Route index element={<Navigate to="/atendimento" replace />} />
          {usuarioLogado.nivel === 1 && (
            <>
              <Route path="usuarios" element={<GerenciarUsuarios />} />
              <Route path="aprovacao-sessoes" element={<AprovacaoSessao/>}></Route>
              <Route path="exercicios" element={<GerenciarExercicio />} />
              <Route path="tipo-intervencao-clinica" element={<GerenciarTipoExercicio/>}></Route>
            </>
          )}
          <Route path="meus-dados" element={<MeusDados />} />
          <Route path="pacientes" element={<GerenciarPaciente />} />    
          <Route path="sessoes" element={<GerenciarSessao/>}></Route>
          <Route path="atendimento" element={<Atendimento/>}></Route>
          <Route path="sessao/execucao/:id" element={<ExecucaoSessao/>}></Route>
          <Route path="relatorio/gravacoes" element={<RelatorioGravacoes/>}></Route>
          <Route path="relatorio/observacao" element={<RelatorioObservacoes/>}></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  );
}