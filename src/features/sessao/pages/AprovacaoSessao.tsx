import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AutoContext';
import { useSessao } from '../../../contexts/SessaoContext';
import type { Sessao } from '../types/sessao'
import { sessaoService } from '../../../services/sessaoService';
export function AprovacaoSessao() 
{
  
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  const [modalRecusaAberto, setModalRecusaAberto] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<number | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const { usuarioLogado } = useAuth();
  const { atualizarSessoes } = useSessao();
   useEffect(() => {
      carregarSessoesPendentes();
    }, []);

  async function carregarSessoesPendentes() 
  {
    try{
      const dados = await sessaoService.getAllPendenteByFisioterapeutaId(usuarioLogado?.id!)
      setSessoes(dados)
    }catch(error)
    {
      console.log("Erro ao Carregar Sessões: "+ error)
    }
  }
  async function onAprovarSessaoPendente(idSessao: number) {
    if (confirm("Confirmar a Aprovação da Sessão?"))
    {
      console.log("Aprovado o ID:", idSessao, "Pelo usuário:", usuarioLogado?.id);
      const novoAprovacaoSessao = {
        motivo: motivoRecusa,
        status: "Aprovada",
        fisioterapeuta: usuarioLogado!
      };
      await sessaoService.aprovarSessao(novoAprovacaoSessao, idSessao)
      carregarSessoesPendentes();
      atualizarSessoes();
    }
  }

  function abrirModalRecusa(id: number) {
    setSessaoSelecionada(id);
    setMotivoRecusa('');
    setModalRecusaAberto(true);
  }

  async function onRecusarSessaoPendente(idSessao: number)
  {
    if (!motivoRecusa.trim()) {
      alert("Campo Não Preenchido");
      return;
    }
    console.log("Recusado o ID:", sessaoSelecionada, "Motivo:", motivoRecusa);
     const novoAprovacaoSessao = {
        data_hora: new Date().toISOString(),
        motivo: motivoRecusa,
        status: "Recusada",
        fisioterapeuta: usuarioLogado!
      };
      await sessaoService.aprovarSessao(novoAprovacaoSessao, idSessao)
      carregarSessoesPendentes();
      setModalRecusaAberto(false);
      atualizarSessoes();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Revisão de Sessões Pendentes</h1>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
          {sessoes.length} Aguardando Análise
        </span>
      </div>

      {sessoes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500">
          Nenhuma Sessão Aguardando Aprovação Encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessoes.map(sessao => (
            <div key={sessao.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{sessao.paciente.nome}</h3>
                  <h3 className="text-sm text-gray-500 font-medium mt-1">{sessao.responsavel.nome}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Agendado para: {new Date(sessao.data_hora).toLocaleDateString('pt-BR')} às {new Date(sessao.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
              
              <div className="p-6 flex-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ambiente(s) Virtuai(s)</h4>
                <ul className="space-y-2">
                  {sessao.sessaoFases.map(fase => (
                    <li key={fase.ordem} className="flex gap-3 text-sm text-gray-700 bg-blue-50/50 p-2.5 rounded-md border border-blue-100">
                      <span className="font-bold text-blue-600 w-5">{fase.ordem}º</span> 
                      <span className="font-medium">{fase.exercicio.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button 
                  onClick={() => onAprovarSessaoPendente(sessao.id!)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md shadow-sm transition-colors active:scale-95"
                >
                  Aprovar
                </button>
                <button 
                  onClick={() => abrirModalRecusa(sessao.id!)}
                  className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 font-medium py-2 rounded-md shadow-sm transition-colors active:scale-95"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalRecusaAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Motivo do Recusamento</h3>
            <p className="text-sm text-gray-500 mb-5">
              Descreva o Motivo do Recusamento. O Monitor Receberá este Aviso para Ajustar a Sessão.
            </p>
            <textarea 
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-5 h-32 resize-none text-sm text-gray-700"
              placeholder="Ex: Reagendado para tal dia, remova tal fase, etc..."
              value={motivoRecusa}
              onChange={e => setMotivoRecusa(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setModalRecusaAberto(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => onRecusarSessaoPendente(sessaoSelecionada!)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
              >
                Confirmar 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}