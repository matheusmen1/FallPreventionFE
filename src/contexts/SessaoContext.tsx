import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { sessaoService } from '../services/sessaoService';
import { useAuth } from './AutoContext'; 

interface SessaoContextData {
  qtdPendentes: number;
  qtdRecusadas: number;
  qtdeAprovadas: number;
  qtdeAprovadasMonitores: number;
  qtdeAprovadasAutorizadas: number;
  carregarSessoesAprovadasAutorizadas(): Promise<void>;
  carregarSessoesAprovadas: () => Promise<void>;
  atualizarSessoes: () => Promise<void>;
  carregarSessoesAprovadasMonitores: () => Promise<void>;
}

const SessaoContext = createContext<SessaoContextData>({} as SessaoContextData);

export function SessaoProvider({ children }: { children: ReactNode }) 
{
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [qtdRecusadas, setQtdRecusadas] = useState(0);
  const [qtdeAprovadas, setQtdeAprovadas] = useState(0);
  const [qtdeAprovadasMonitores, setQtdeAprovadasMonitores] = useState(0);
  const [qtdeAprovadasAutorizadas, setQtdeAprovadasAutorizadas] = useState(0);
  const { usuarioLogado } = useAuth();

  async function atualizarSessoes()
 {
    if (usuarioLogado?.nivel === 1)
    { 
      try {
        const dados = await sessaoService.getAllPendenteByFisioterapeutaId(usuarioLogado?.id!);
        setQtdPendentes(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Pendentes: ", error);
      }
    }
    else
    {
        try {
        const dados = await sessaoService.getAllByStatusId("RECUSADA", usuarioLogado?.id!);
        setQtdRecusadas(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Canceladas: ", error);
      }
    }
  }
  async function carregarSessoesAprovadas()
  {
    if (usuarioLogado)
    {
      try {
        const dados = await sessaoService.getAllByStatusId("APROVADA", usuarioLogado?.id!);
        setQtdeAprovadas(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Aprovadas: ", error);
      }
    }
  }
  async function carregarSessoesAprovadasMonitores()
  {
    if (usuarioLogado)
    {
      try {
        const dados = await sessaoService.getAllByResponsavelIdAndStatus(usuarioLogado?.id!, "APROVADA");
        setQtdeAprovadasMonitores(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Aprovadas: ", error);
      }
    }
  }
  async function carregarSessoesAprovadasAutorizadas()
  {
    if (usuarioLogado)
    {
      try {
        const dados = await sessaoService.getAllSessoesAutorizadasByMonitor(usuarioLogado?.id!, "APROVADA");
        setQtdeAprovadasAutorizadas(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Aprovadas: ", error);
      }
    }
  }
  useEffect(() => {
    atualizarSessoes();
    carregarSessoesAprovadas();
    carregarSessoesAprovadasMonitores();
    carregarSessoesAprovadasAutorizadas();
  }, [usuarioLogado]);

  return (
    <SessaoContext.Provider value={{ qtdPendentes, qtdRecusadas, qtdeAprovadas, qtdeAprovadasMonitores, qtdeAprovadasAutorizadas, carregarSessoesAprovadasAutorizadas, atualizarSessoes, carregarSessoesAprovadas, carregarSessoesAprovadasMonitores }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}