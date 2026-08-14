import { useEffect, useState } from 'react';
import type { Sessao } from '../types/sessao'; 
import type { Paciente } from '../../paciente/types/paciente';

import { sessaoService } from '../../../services/sessaoService'; 
import { pacienteService } from '../../../services/pacienteService';
import type { SessaoGravacao } from '../types/sessaoGravacao'; 

export function RelatorioGravacoes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  
  const [pacienteSelecionado, setPacienteSelecionado] = useState<number | ''>('');
  const [sessaoSelecionada, setSessaoSelecionada] = useState<number | ''>('');
 
  const [gravacoes, setGravacoes] = useState<SessaoGravacao[]>([]);
  
  const [carregando, setCarregando] = useState(true);
  const [carregandoTabela, setCarregandoTabela] = useState(false);

  const [gravacaoAssistindo, setGravacaoAssistindo] = useState<number | null>(null);
  const [urlGravacaoAssistindo, setUrlGravacaoAssistindo] = useState<string>('');

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try {
        setCarregando(true);
        const dadosPacientes = await pacienteService.getAll();
        setPacientes(dadosPacientes);
    } catch (error) {
        console.error("Erro ao Buscar Dados Iniciais:", error);
    } finally {
        setCarregando(false);
    }
  }

  async function carregarSessoesByPaciente(pacienteId: number) {
    try {
      setCarregandoTabela(true);
      const dados = await sessaoService.getAllByPacienteId(pacienteId);
      setSessoes(dados);
    } catch (error) {
      console.error("Erro ao Carregar Sessões por Paciente:", error);
    } finally {
      setCarregandoTabela(false);
    }
  }

  async function carregarGravacoesBySessaoIdAndPaciente(sessaoId: number, pacienteId: number) {
    try {
        setCarregandoTabela(true);
        const dados = await sessaoService.getAllGravacoesBySessao(sessaoId, pacienteId);
        setGravacoes(dados);
    } catch (error) {
        console.error("Erro ao Carregar Gravações:", error);
    } finally {
        setCarregandoTabela(false);
    }
  }

  async function onExcluirGravacao(id: number)
  {
    if(window.confirm("Tem Certeza que Deseja Excluir esta Gravação?"))
    {
      try {
          await sessaoService.deleteGravacao(id);
          if (sessaoSelecionada !== '')
        {
              carregarGravacoesBySessaoIdAndPaciente(sessaoSelecionada as number, pacienteSelecionado as number);
          }
      } catch (error)
      {
          console.error("Erro ao Excluir Gravação:", error);
      }
    }

    
  }
  async function carregarUrlGravacao(gravacaoId: number) {
    try {
      const blob = await sessaoService.playGravacao(gravacaoId);
      const url = URL.createObjectURL(blob);
      setUrlGravacaoAssistindo(url);
    } catch (error) {
      console.error("Erro ao Carregar Gravação:", error);
    }
  }
  function formatarData(data: string | Date | undefined) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Relatório de Gravações de Vídeo</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Selecione o Paciente:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={pacienteSelecionado}
              onChange={(e) => {
                const pacienteId = e.target.value === '' ? '' : Number(e.target.value);
                setPacienteSelecionado(pacienteId);
                setSessaoSelecionada('');
                setGravacoes([]); 
                if (pacienteId !== '') {
                    carregarSessoesByPaciente(pacienteId);
                }
              }}
              disabled={carregando}
            >
              <option value="">-- Selecione um Paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Selecione a Sessão:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
              value={sessaoSelecionada}
              onChange={(e) => {
                const sessaoId = e.target.value === '' ? '' : Number(e.target.value);
                setSessaoSelecionada(sessaoId);
                if (sessaoId !== '') {
                    carregarGravacoesBySessaoIdAndPaciente(sessaoId, pacienteSelecionado as number);
                } else {
                  setGravacoes([]);
                }
              }}
              disabled={carregando}
            >
              <option value="">
                {pacienteSelecionado === '' 
                  ? '-- Selecione o Paciente Primeiro --' 
                  : sessoes.length === 0 
                    ? '-- Nenhuma Sessão Encontrada --' 
                    : '-- Escolha Uma Sessão --'}
              </option>
              {sessoes.map((sessao) => (
                <option key={sessao.id} value={sessao.id}>
                  Sessão - {formatarData(sessao.data_hora)} - {sessao.status}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data / Hora 
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregandoTabela ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Carregando Gravações...
                </td>
              </tr>
            ) : sessaoSelecionada === '' ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  
                </td>
              </tr>
            ) : gravacoes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma Gravação Encontrada para esta sessão.
                </td>
              </tr>
            ) : (
              gravacoes.map((gravacao) => (
                <tr key={gravacao.id} className="hover:bg-gray-50 transition-colors">
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatarData(gravacao.data_hora)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setGravacaoAssistindo(gravacao.id);
                          carregarUrlGravacao(gravacao.id);
                        }}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100"
                      >
                        Assistir
                      </button>
                      <button 
                        onClick={() => onExcluirGravacao(gravacao.id)} 
                        className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100"
                      >
                        Excluir
                      </button>
                    </div>
                  
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {gravacaoAssistindo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col">
            
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Assistindo Gravação</h2>
              <button 
                onClick={() => setGravacaoAssistindo(null)}
                className="text-gray-500 hover:text-red-600 p-1 rounded transition-colors"
              >
                ✕ Fechar
              </button>
            </div>
            
            <div className="w-full bg-black">
              <video 
                controls
                autoPlay 
                controlsList="nodownload" 
                className="w-full h-[60vh] object-contain"
                src={urlGravacaoAssistindo} 
              >
                Seu navegador não suporta a reprodução deste vídeo.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}