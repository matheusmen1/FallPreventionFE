import { useEffect, useState } from 'react';
import type { Sessao } from '../types/sessao'; 
import type { Paciente } from '../../paciente/types/paciente';

import { sessaoService } from '../../../services/sessaoService'; 
import { pacienteService } from '../../../services/pacienteService';
import type { SessaoObservacao } from '../types/sessaoObservacao';

export function RelatorioObservacoes()
 {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  
  const [pacienteSelecionado, setPacienteSelecionado] = useState<number | ''>('');
  const [sessaoSelecionada, setSessaoSelecionada] = useState<number | ''>('');
 
  const [observacoes, setObservacoes] = useState<SessaoObservacao[]>([]);
  
  const [carregando, setCarregando] = useState(true);
  const [carregandoTabela, setCarregandoTabela] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try{
        setCarregando(true);
        const [dadosPacientes] = await Promise.all([
            pacienteService.getAll()
        ]);
        setPacientes(dadosPacientes);
    } catch (error) {
        console.error("Erro ao Buscar Dados Iniciais:", error);
    } finally {
        setCarregando(false);
    }
  }
  async function carregarSessoesByPaciente(pacienteId: number) 
  {
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
  async function carregarObservacoesBySessaoIdAndPacienteId(sessaoId: number, pacienteId: number)
  {
    try{
        setCarregandoTabela(true);
        const dados = await sessaoService.getAllObservacoesByPacienteAndSessao(sessaoId, pacienteId);
        setObservacoes(dados);
    }catch(error){
        console.error("Erro ao Carregar Observações:", error);
    } finally{
        setCarregandoTabela(false);
    }
  }
  async function onExcluirObservacao(id: number)
  {
    try{
      if (confirm("Tem Certeza que Deseja Excluir esta Observação?")) { 
      await sessaoService.deleteObservacao(id);
        if (sessaoSelecionada !== '' && pacienteSelecionado !== '') {
            carregarObservacoesBySessaoIdAndPacienteId(sessaoSelecionada as number, pacienteSelecionado as number);
        }
      }
    }catch(error){
        console.error("Erro ao Excluir Observação:", error);
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
        <h1 className="text-2xl font-bold text-gray-800">Relatório de Observações</h1>
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
              onChange={ (e) => {
                const pacienteId = e.target.value === '' ? '' : Number(e.target.value);
                setPacienteSelecionado(pacienteId);
                carregarSessoesByPaciente(pacienteId as number);
                setSessaoSelecionada('');
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
                setSessaoSelecionada(e.target.value === '' ? '' : Number(e.target.value));
                if (e.target.value !== '' && pacienteSelecionado !== '') {
                  carregarObservacoesBySessaoIdAndPacienteId(Number(e.target.value), pacienteSelecionado as number);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Data / Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Ambiente Virtual / Atividade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/4">
                Observação
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregandoTabela ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Carregando Observações...
                </td>
              </tr>
            ) : sessaoSelecionada === '' ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  
                </td>
              </tr>
            ) : observacoes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma Observação Encontrada.
                </td>
              </tr>
            ) : (
              observacoes.map((obs) => (
                <tr key={obs.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatarData(obs.data_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {obs.sessaoFase ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {obs.sessaoFase.ordem}º - {obs.sessaoFase.exercicio.nome}
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Geral
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-wrap">
                    {obs.observacao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                          onClick={() => onExcluirObservacao(obs.id!)} 
                          className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100"
                        >
                          Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}