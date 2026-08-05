import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { sessaoService } from '../services/sessaoService';
import { useAuth } from './AutoContext'; 

interface SessaoContextData {
  qtdPendentes: number;
  qtdRecusadas: number;
  atualizarSessoes: () => Promise<void>;
}

const SessaoContext = createContext<SessaoContextData>({} as SessaoContextData);

export function SessaoProvider({ children }: { children: ReactNode }) 
{
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [qtdRecusadas, setQtdRecusadas] = useState(0);

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
        const dados = await sessaoService.getAllByStatus("RECUSADA", usuarioLogado?.id!);
        setQtdRecusadas(dados.length);
      } catch (error) {
        console.error("Erro ao Buscar Sessões Canceladas: ", error);
      }
    }
  }

  useEffect(() => {
    atualizarSessoes();
  }, [usuarioLogado]);

  return (
    <SessaoContext.Provider value={{ qtdPendentes, qtdRecusadas, atualizarSessoes }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}