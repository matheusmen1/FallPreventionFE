import { useEffect, useState } from 'react';
import type { Sessao } from '../types/sessao'; 
import type { Paciente } from '../../paciente/types/paciente';
import type { Exercicio } from '../../exercicio/types/exercicio';

import { sessaoService } from '../../../services/sessaoService'; 
import { pacienteService } from '../../../services/pacienteService';
import { exercicioService } from '../../../services/exercicioService';

import { FormSessao } from '../components/FormSessao'; 
import { useAuth } from '../../../contexts/AutoContext';
import { useSessao } from '../../../contexts/SessaoContext';
export function GerenciarSessao() 
{
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [sessaoEmEdicao, setSessaoEmEdicao] = useState<Sessao | null>(null);

  const { usuarioLogado } = useAuth();
  const { atualizarSessoes, carregarSessoesAprovadas } = useSessao();
  const [btSelecionado, setBtSelecionado] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try {
      setCarregando(true);

      if (usuarioLogado && usuarioLogado.id != null)
      {
        if (usuarioLogado.nivel > 0)
        {
          const dados = await sessaoService.getAll();
          setSessoes(dados);
        }
        else
        {
          const dados = await sessaoService.getAllByResponsavelId(usuarioLogado.id);
          setSessoes(dados);   
        }
       
      }
      

      const [dadosPacientes, dadosExercicios] = await Promise.all([
        pacienteService.getAll(),
        exercicioService.getAll()
      ]);

      setPacientes(dadosPacientes);
      setExercicios(dadosExercicios);

    } catch (error) {
      console.error("Erro ao buscar dados iniciais:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarSessoes() {
    try {
      if (usuarioLogado && usuarioLogado.id != null) {
        if (usuarioLogado.nivel > 0) {
          const dados = await sessaoService.getAll();
          setSessoes(dados);
        } else {
          const dados = await sessaoService.getAllByResponsavelId(usuarioLogado.id);
          setSessoes(dados);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
    }
  }
  
  async function buscarMinhasSessoes() {
    try {
      setCarregando(true);
      if (usuarioLogado && usuarioLogado.id) {
        const dados = await sessaoService.getAllByResponsavelId(usuarioLogado.id);
        setSessoes(dados);
      }
    } catch (error) {
      console.log("Erro ao buscar sessões filtradas: ", error);
    } finally {
      setCarregando(false);
    }
  }

  function onNovaSessao() {
    setSessaoEmEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(sessao: Sessao) {
    setSessaoEmEdicao(sessao); 
    setExibirFormulario(true); 
  }

  function onCancelar() {
    setExibirFormulario(false); 
  }

  async function salvar(sessaoForm: Sessao) {
    try {
      if (sessaoForm.id) {
        await sessaoService.put(sessaoForm);
      } else {
        await sessaoService.add(sessaoForm);
      }
      setExibirFormulario(false); 
      carregarSessoes(); 
      atualizarSessoes();
      if (usuarioLogado && usuarioLogado.id != null)
      {
        if (usuarioLogado.nivel > 0)
        {
          carregarSessoesAprovadas();
        }
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a sessão.");
    }
  }

  async function excluir(sessao: Sessao) {
    if (sessao.id == null) {
      alert("ID da sessão inválido.");
      return;
    }

    const nomePaciente = sessao.paciente?.nome || 'este paciente';
    
    if (confirm(`Tem certeza que deseja excluir a sessão de ${nomePaciente}?`)) {
      try {
        await sessaoService.delete(sessao.id);
        carregarSessoes(); 
        carregarSessoesAprovadas();
        atualizarSessoes();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir a sessão.");
      }
    }
  }

  function formatarData(data: string | Date | undefined) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function renderBadgeStatus(status: string) {
    const statusNormalizado = status?.toUpperCase() || '';
    switch (statusNormalizado) {
      case 'APROVADA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aprovada</span>;
      case 'PENDENTE':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Pendente</span>;
      case 'CONCLUIDA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Concluída</span>;
      case 'RECUSADA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Alterações Solicitadas</span>;
      case 'EM_ANDAMENTO':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Andamento</span>;
      case 'PAUSADA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pausada</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'Indefinido'}</span>;
    }
  }

  if (exibirFormulario) {
    return (
      <div className="space-y-6">
        <FormSessao 
          onCancelar={onCancelar} 
          onSalvar={salvar} 
          sessaoParaAlterar={sessaoEmEdicao}
          listaPacientes={pacientes}
          listaExercicios={exercicios}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Sessões</h1>
        <button onClick={onNovaSessao} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Nova Sessão
        </button>
      </div>
      
      {usuarioLogado != null && usuarioLogado.nivel > 0 && ( <div className="mb-4">
        <button
          onClick={() => {
            setBtSelecionado(!btSelecionado); 
            if(!btSelecionado) buscarMinhasSessoes(); 
            else carregarSessoes();
          }}
          className={`px-4 py-2 rounded-md transition-all ${
            btSelecionado
              ? "bg-blue-800 text-white shadow-inner scale-95"
              : "bg-blue-600 text-white shadow hover:bg-blue-700"
          }`}
        >
          Minhas Sessões
        </button>
      </div>)}

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data / Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervenções Clínicas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) : sessoes.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhuma Sessão Encontrada.</td></tr>
            ) : (
              sessoes.map((sessao) => (
                <tr key={sessao.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatarData(sessao.data_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sessao.paciente ? sessao.paciente.nome : 'Não Vinculado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sessao.responsavel ? sessao.responsavel.nome : 'Não Atribuído'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sessao.sessaoFases ? `${sessao.sessaoFases.length} Intervenção(s) Clínica(s) ` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderBadgeStatus(sessao.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => onAlterar(sessao)}  
                        className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100"
                      >
                        Alterar
                      </button>
                      <button 
                        onClick={() => excluir(sessao)} 
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
    </div>
  );
}