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

    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. Selecione o Paciente:
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-colors"
            value={pacienteSelecionado}
            onChange={(e) => {
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
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

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[300px]">
      
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {sessaoSelecionada ? 'Prontuário da Sessão' : 'Anotações'}
        </h2>
      </div>

      <div className="p-6 flex-1 bg-white">
        {carregandoTabela ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-medium animate-pulse">
            Carregando Observações...
          </div>
        ) : sessaoSelecionada === '' ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            
            <p>Selecione uma Sessão Acima Para ver o Relatório.</p>
          </div>
        ) : observacoes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p>Nenhuma Observação Registrada Para Esta Sessão.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {observacoes.map((obs) => (
              <div key={obs.id} className="relative group pl-4 border-l-2 border-blue-200 hover:border-blue-500 transition-colors">
                
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-slate-50 p-4 rounded-r-xl rounded-bl-xl border border-slate-100">
                  {obs.observacao || <span className="text-gray-400 italic">Nenhuma Observação Registrada.</span>}
                </div>
                <div className="flex justify-between items-start mb-3">
                  <button 
                    onClick={() => onExcluirObservacao(obs.id!)} 
                    className="text-xs px-3 py-1.5 rounded bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm flex items-center gap-1 opacity-70 group-hover:opacity-100"
                    title="Excluir Anotação"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}