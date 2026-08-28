import { useState, useEffect } from 'react';
import type { Sessao } from '../types/sessao';
import type { Paciente } from '../../paciente/types/paciente';
import type { Exercicio } from '../../exercicio/types/exercicio'; 
import type { SessaoFase } from '../types/sessaoFase'; 
import { useAuth } from '../../../contexts/AutoContext'; 

interface FormProps {
  onCancelar: () => void;
  onSalvar: (sessao: Sessao) => void;
  sessaoParaAlterar?: Sessao | null;
  listaPacientes: Paciente[];
  listaExercicios: Exercicio[]; 
}

export function FormSessao({ 
  onCancelar, 
  onSalvar, 
  sessaoParaAlterar, 
  listaPacientes,
  listaExercicios 
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

  function adicionarFase(exercicioId: number) {
    const exercicioCompleto = listaExercicios.find(ex => ex.id === exercicioId);
    if (!exercicioCompleto) return;

    const fasesAtuais = formData.sessaoFases || [];
    
    const novaFase: SessaoFase = {
      exercicio: exercicioCompleto,
      ordem: fasesAtuais.length + 1,
      repeticao: 5,
      tempo: 30,
      is_repeticao: true
    };

    setFormData({
      ...formData,
      sessaoFases: [...fasesAtuais, novaFase]
    });
  }

  function removerFase(indexParaRemover: number)
   {
    const fasesAtuais = [...(formData.sessaoFases || [])];
    fasesAtuais.splice(indexParaRemover, 1);
    
    fasesAtuais.forEach((fase, index) => {
      fase.ordem = index + 1;
    });

    setFormData({ ...formData, sessaoFases: fasesAtuais });
  }
  function alterarModo(index: number, isRepeticao: boolean)
  {
  const fasesAtuais = [...(formData.sessaoFases || [])];
  
  fasesAtuais[index].is_repeticao = isRepeticao;
  
  setFormData({ ...formData, sessaoFases: fasesAtuais });
 }
function alterarValor(index: number, alteracao: number) 
{
  const fasesAtuais = [...(formData.sessaoFases || [])];
  
  const faseAtual = fasesAtuais[index];
  
  if (!faseAtual.is_repeticao) 
  {
    const tempoAtual = faseAtual.tempo || 30;
    faseAtual.tempo = Math.max(10, tempoAtual + alteracao);
  } 
  else
  {
    const qtdAtual = faseAtual.repeticao || 5;
    faseAtual.repeticao = Math.max(1, qtdAtual + alteracao);
  }
  
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
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <h3 className="text-red-800 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              ⚠️ Sessão Recusada - Alterações Solicitadas
            </h3>
            <p className="text-red-700 mt-2 text-sm">
              <strong>Motivo da Recusa:</strong> {sessaoParaAlterar.aprovacaoSessao?.motivo || 'Nenhum Motivo Informado'}
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
              <div className="max-w-xl">
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
            </div>
          )}

          {passoAtual === 2 && (
            <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Catálogo de Intervenções Clínicas</h3>
                <p className="text-sm text-gray-500 mb-4">Clique na Intervenção Clínica para Adicioná-la à Sessão.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {listaExercicios.map(ex => (
                    <div 
                      key={ex.id} 
                      onClick={() => adicionarFase(ex.id!)}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group bg-white relative overflow-hidden"
                    >
                      <div className="w-full h-24 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400 text-xs italic group-hover:bg-blue-50 transition-colors">
                        [ Imagem do Exercício ]
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">{ex.nome}</h4>
                      <h3 className="text-sm text-gray-500">{ex.tipo_exercicio.nome}</h3>
                      <p className="text-xs font-mono text-gray-500 mt-1 truncate">{ex.codigo_nome}</p>
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        +
                      </div>
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
                
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                  {formData.sessaoFases && formData.sessaoFases.length > 0 ? (
                    <div className="space-y-3">
                      {formData.sessaoFases.map((fase, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col">
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="bg-gray-100 text-gray-600 font-bold w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">
                                {fase.ordem}
                              </span>
                              <span className="font-bold text-gray-800 truncate text-sm">
                                {fase.exercicio.nome}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removerFase(index)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Remover exercício"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 mt-1 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Modo de Intervenção Clínica:
                              </span>
                              <div className="flex bg-gray-200 p-1 rounded-md">
                                <button
                                  type="button"
                                  onClick={() => alterarModo(index, true)}
                                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                                    fase.is_repeticao 
                                      ? 'bg-white text-blue-700 shadow' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  Repetições
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alterarModo(index, false)} 
                                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                                    !fase.is_repeticao 
                                      ? 'bg-white text-blue-700 shadow' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  Tempo
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-2">
                              <span className="text-sm text-gray-700 font-semibold">
                                {!fase.is_repeticao ? 'Tempo:' : 'Quantidade:'}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {!fase.is_repeticao && (
                                  <div className="flex gap-1 mr-2 hidden sm:flex">
                                    <button 
                                      type="button" 
                                      onClick={() => alterarValor(index, 30)}
                                      className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 font-bold"
                                    >
                                      +30s
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => alterarValor(index, 60)}
                                      className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 font-bold"
                                    >
                                      +60s
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center bg-gray-50 border border-gray-300 rounded shadow-sm overflow-hidden">
                                  <button 
                                    type="button" 
                                    onClick={() => alterarValor(index, !fase.is_repeticao ? -10 : -1)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-r border-gray-300 transition-colors"
                                  >
                                    -
                                  </button>
                                  
                                  <span className="w-12 text-center font-bold text-blue-700 text-sm">
                                    {!fase.is_repeticao 
                                      ? (fase.tempo || 30) 
                                      : (fase.repeticao || 5) 
                                    }
                                    <span className="text-[10px] text-gray-400 ml-1">
                                      {!fase.is_repeticao ? 's' : ''}
                                    </span>
                                  </span>
                                  
                                  <button 
                                    type="button" 
                                    onClick={() => alterarValor(index, !fase.is_repeticao ? 10 : 1)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold border-l border-gray-300 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                      <p>Nenhuma Intervenção Clínica Selecionada.</p>
                      <p className="text-sm mt-2">Escolha as Intervenções Clínicas no Catálogo ao Lado.</p>
                    </div>
                  )}
                </div>
              </div>
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