import { useState, useEffect } from 'react';
import type { Sessao } from '../types/sessao';
import type { Paciente } from '../../paciente/types/paciente';
import type { Exercicio } from '../../exercicio/types/exercicio'; 
import { useAuth } from '../../../contexts/AutoContext'; 
import type { TipoExercicio } from '../../tipoExercicio/types/tipoExercicio';
import { API_URL } from '../../../services/api';

interface FormProps {
  onCancelar: () => void;
  onSalvar: (sessao: Sessao) => void;
  sessaoParaAlterar?: Sessao | null;
  listaPacientes: Paciente[];
  listaTipoExercicio: TipoExercicio[];
  listaExercicios: Exercicio[]; 
}

export function FormSessao({ 
  onCancelar, 
  onSalvar, 
  sessaoParaAlterar, 
  listaPacientes,
  listaExercicios,
  listaTipoExercicio
}: FormProps) {
  
  const { usuarioLogado } = useAuth(); 
  
  const [passoAtual, setPassoAtual] = useState(1);

  const [formData, setFormData] = useState<Partial<Sessao>>({
    data_hora: '',
    status: 'Pendente',
    paciente: undefined,
    responsavel: usuarioLogado!, 
    sessaoFases: [],
    observacao: ''
  });
 const [filtroTipoId, setFiltroTipoId] = useState<number | null>(null);

const [exercicioEmConfiguracao, setExercicioEmConfiguracao] = useState<Exercicio | null>(null);

const [configTemp, setConfigTemp] = useState({ is_repeticao: false, valor: 30 });
const exerciciosFiltrados = filtroTipoId 
  ? listaExercicios.filter(ex => ex.tipo_exercicio.id === filtroTipoId) 
  : listaExercicios;
  useEffect(() => {
    if (sessaoParaAlterar) {
      let dataFormatada = sessaoParaAlterar.data_hora;
      if (dataFormatada && dataFormatada.length > 16) {
        dataFormatada = dataFormatada.substring(0, 16);
      }
      
      setFormData({
        ...sessaoParaAlterar,
        data_hora: dataFormatada,
        sessaoFases: sessaoParaAlterar.sessaoFases || [] 
      });
    }
  }, [sessaoParaAlterar]);

  function removerFase(indexParaRemover: number)
   {
    const fasesAtuais = [...(formData.sessaoFases || [])];
    fasesAtuais.splice(indexParaRemover, 1);
    
    fasesAtuais.forEach((fase, index) => {
      fase.ordem = index + 1;
    });

    setFormData({ ...formData, sessaoFases: fasesAtuais });
  }

  const podeAvancar = () => {
    if (passoAtual === 1) return !!formData.paciente;
    if (passoAtual === 2) return (formData.sessaoFases && formData.sessaoFases.length > 0);
    if (passoAtual === 3) {
        return true;
    }
  };

 const avancarPasso = () => {
    if (podeAvancar() && passoAtual < 4) { 
        setPassoAtual(prev => prev + 1);
    }
  };

  const voltarPasso = () => {
    if (passoAtual > 1) {
        setPassoAtual(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {sessaoParaAlterar ? 'Alterar Sessão' : 'Nova Sessão'}
        </h2>
        
       <div className="flex items-center justify-center space-x-2 md:space-x-4 text-sm md:text-base">
  
          <div className={`flex items-center ${passoAtual >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>1</div>
            <span className="ml-2 font-medium hidden sm:inline">Paciente</span>
          </div>
          <div className={`w-8 md:w-12 h-1 rounded ${passoAtual >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${passoAtual >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>2</div>
            <span className="ml-2 font-medium hidden sm:inline">Intervenção Clínica</span>
          </div>
          <div className={`w-8 md:w-12 h-1 rounded ${passoAtual >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>

          <div className={`flex items-center ${passoAtual >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>3</div>
            <span className="ml-2 font-medium hidden sm:inline">Observações</span>
          </div>
          <div className={`w-8 md:w-12 h-1 rounded ${passoAtual >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${passoAtual === 4 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual === 4 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>4</div>
            <span className="ml-2 font-medium hidden sm:inline">Agendamento</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        {sessaoParaAlterar?.status?.toUpperCase() === 'RECUSADA' && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm whitespace-pre-wrap">
            <h3 className="text-red-800 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              ⚠️ Alterações Solicitadas Por {sessaoParaAlterar.responsavel.responsavel?.nome}
            </h3>
            <p className="text-red-700 mt-2 text-sm">
              <strong>Motivo:</strong> {sessaoParaAlterar.aprovacaoSessao?.motivo || 'Nenhum Motivo Informado'}
            </p>
            <p className="text-red-600 text-xs mt-2 italic">
              Altere os Dados Necessários nos Passos Abaixo e Clique em Confirmar Para Reenviar a Sessão para Aprovação.
            </p>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); onSalvar(formData as Sessao); }}>
          
          {passoAtual === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Selecione o Paciente</h3>
              
              <div className="max-w-xl mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2"></label>
                <select 
                  required 
                  value={formData.paciente?.id || ''} 
                  onChange={e => {
                    const p = listaPacientes.find(p => p.id === Number(e.target.value));
                    setFormData({ ...formData, paciente: p });
                  }}
                  className="w-full rounded-lg border border-gray-300 p-4 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg transition-all"
                >
                  <option value="">-- Clique Aqui para Selecionar --</option>
                  {listaPacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              {formData.paciente && (
                <div className="max-w-xl p-5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-fade-in">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                    Resumo do Paciente
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Nome Completo</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.nome}
                      </span>
                    </div>
                    
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">CPF</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.cpf || 'Não cadastrado'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Telefone</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.telefone || 'Não cadastrado'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Data de Nascimento</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.data_nascimento 
                          ? new Date(formData.paciente.data_nascimento).toLocaleDateString('pt-BR') 
                          : 'Não cadastrada'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Tipo de Pessoa</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.tipo_pessoa || 'Não cadastrado'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Doença</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.doenca?.nome  || 'Nenhuma'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Observações</span>
                      <span className="text-sm text-slate-800 font-medium">
                        {formData.paciente.observacao  || 'Nenhuma'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {passoAtual === 2 && (
            <div className="animate-fade-in relative">
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 border-r border-gray-200 pr-8">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Catálogo de Intervenções Clínicas</h3>
                      <p className="text-sm text-gray-500">Selecione para Configurar e Adicionar à Sessão.</p>
                    </div>
                    
                    <div className="w-64">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Filtrar por Tipo de Intervenção</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filtroTipoId || ''}
                        onChange={e => setFiltroTipoId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Todos os Tipos de Intervenção</option>
                        {listaTipoExercicio.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {exerciciosFiltrados.map(ex => (
                      <div 
                        key={ex.id} 
                        onClick={() => {
                          setExercicioEmConfiguracao(ex);
                          setConfigTemp({ is_repeticao: true, valor: 5 }); 
                        }}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group bg-white relative overflow-hidden"
                      >
                        <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400 overflow-hidden">
                          {ex.url_foto ? (
                            <img src={`${API_URL}${ex.url_foto}`} alt={ex.nome} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs italic">Sem Imagem</span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{ex.nome}</h4>
                        <h3 className="text-sm text-blue-600 font-medium mt-1">{ex.tipo_exercicio.nome}</h3>
                        <h3 className="text-sm text-gray-600 font-medium mt-1">{ex.descricao}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-1/3 bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                    Sua Seleção
                    <span className="bg-blue-600 text-white text-xs py-1 px-2 rounded-full">
                      {formData.sessaoFases?.length || 0}
                    </span>
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto max-h-[500px]">
                    {formData.sessaoFases && formData.sessaoFases.length > 0 ? (
                      <div className="space-y-3">
                        {formData.sessaoFases.map((fase, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">
                                  {fase.ordem}
                                </span>
                                <span className="font-bold text-gray-800 text-sm">{fase.exercicio.nome}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-7 font-medium">
                                {fase.is_repeticao ? `${fase.repeticao} Repetições` : `${fase.tempo} Segundos`}
                              </p>
                            </div>
                            <button type="button" onClick={() => removerFase(index)} className="text-red-400 hover:text-red-600 p-2">✕</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <p>Sessão Vazia.</p>
                        <p className="text-sm mt-2">Clique em uma Intervenção ao Lado Para Configurar e Adicionar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {exercicioEmConfiguracao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row">
                    
                    <div className="w-full md:w-1/2 bg-slate-100 relative">
                      {exercicioEmConfiguracao.url_video ? (
                        <video 
                          src={`${API_URL}${exercicioEmConfiguracao.url_video}`}
                          className="w-full h-full object-cover min-h-[300px]"
                          autoPlay loop muted playsInline
                        />
                      ) : exercicioEmConfiguracao.url_foto ? (
                        <img 
                          src={`${API_URL}${exercicioEmConfiguracao.url_foto}`} 
                          className="w-full h-full object-cover min-h-[300px]" 
                          alt="Demonstração" 
                        />
                      ) : (
                        <div className="w-full h-full min-h-[300px] flex items-center justify-center text-slate-400 italic">
                          Mídia não Disponível
                        </div>
                      )}
                      
                      <button 
                        type='button'
                        onClick={() => setExercicioEmConfiguracao(null)}
                        className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 p-6 flex flex-col">
                      <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                        {exercicioEmConfiguracao.nome}
                      </h2>
                      <p className="text-sm text-blue-600 font-bold mb-4">
                        {exercicioEmConfiguracao.tipo_exercicio.nome}
                      </p>
                      
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-700 mb-3 block">Modo de Execução</label>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <button 
                            type='button'
                            onClick={() => setConfigTemp({ is_repeticao: true, valor: 5 })}
                            className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${configTemp.is_repeticao ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                          >
                            Repetições
                          </button>
                          
                          <button 
                            type='button'
                            onClick={() => setConfigTemp({ is_repeticao: false, valor: 30 })}
                            className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${!configTemp.is_repeticao ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                          >
                              Tempo
                          </button>
                          
                        </div>

                        <label className="text-sm font-bold text-slate-700 mb-3 block">
                          {configTemp.is_repeticao ? 'Quantidade de Repetições' : 'Duração em Segundos'}
                        </label>
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 mb-6">
                          <button 
                            type='button'
                            onClick={() => setConfigTemp(prev => ({ ...prev, valor: prev.is_repeticao ? Math.max(1, prev.valor - 1) : Math.max(10, prev.valor - 10) }))}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600 text-xl hover:bg-slate-100"
                          >-</button>
                          
                          <div className="text-3xl font-black text-slate-800">
                            {configTemp.valor} <span className="text-base text-slate-400 font-normal">{!configTemp.is_repeticao ? 's' : ''}</span>
                          </div>
                          
                          <button 
                            type='button'
                            onClick={() => setConfigTemp(prev => ({ ...prev, valor: prev.valor + (prev.is_repeticao ? 1 : 10) }))}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600 text-xl hover:bg-slate-100"
                          >+</button>
                        </div>
                      </div>

                      <button 
                        type='button'
                        onClick={() => {
                          const novaOrdem = (formData.sessaoFases?.length || 0) + 1;
                          const novaFase = {
                            ordem: novaOrdem,
                            exercicio: exercicioEmConfiguracao,
                            is_repeticao: configTemp.is_repeticao,
                            tempo: !configTemp.is_repeticao ? configTemp.valor : undefined,
                            repeticao: configTemp.is_repeticao ? configTemp.valor : undefined
                          };
                          
                          setFormData({
                            ...formData,
                            sessaoFases: [...(formData.sessaoFases || []), novaFase]
                          });
                          
                          setExercicioEmConfiguracao(null);
                        }}
                        className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg flex items-center justify-center gap-2 shadow-lg"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
            )}

          {passoAtual === 3 && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Observações (Opcional)</h3>
              <p className="text-sm text-gray-500 mb-6">
                Escreva Abaixo Observações Importantes Para a Sessão.
              </p>
              
              <div className="bg-white rounded-lg">
                <textarea 
                  value={(formData as any).observacao || ''} 
                  onChange={e => setFormData({...formData, observacao: e.target.value})}
                  placeholder="Digite suas observações aqui..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 p-4 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y transition-all text-gray-700"
                ></textarea>
                
                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-gray-400">
                    {((formData as any).observacao || '').length} caracteres
                  </span>
                </div>
              </div>
            </div>
          )}

        
          {passoAtual === 4 && (
            <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Defina a Data e Hora</h3>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                  <label className="block text-sm font-bold text-blue-900 mb-2"></label>
                  <input 
                    type="datetime-local" required 
                    value={formData.data_hora?.toString() || ''} 
                    onChange={e => setFormData({...formData, data_hora: e.target.value})}
                    className="w-full rounded-lg border border-blue-300 p-4 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-lg transition-all bg-white" 
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/3 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Resumo da Sessão</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Paciente</p>
                    <p className="font-medium text-gray-900">{formData.paciente?.nome}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Carga de Intervenções Clínicas</p>
                    <p className="font-medium text-gray-900">{formData.sessaoFases?.length} Intervenção(s) Clínicas(s)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Observações</p>
                    <p className="font-medium text-gray-900">{formData.observacao || 'Nenhuma Observação'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
            <div>
              {passoAtual > 1 ? (
                <button 
                  type="button" 
                  onClick={voltarPasso}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Voltar
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={onCancelar}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancelar 
                </button>
              )}
            </div>

            <div>
              {passoAtual < 4 ? (
                <button 
                  type="button" 
                  onClick={avancarPasso}
                  disabled={!podeAvancar()}
                  className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
                >
                  Próximo Passo 
                </button>
              ) : (
               <button 
                  type="button" 
                  onClick={(e) => {
                     e.preventDefault(); 
                     onSalvar(formData as Sessao); 
                  }}
                  disabled={!formData.data_hora}
                  className="rounded-lg bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 shadow-lg shadow-green-200"
                >
                   Confirmar 
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}