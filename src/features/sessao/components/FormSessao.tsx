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

  const [formData, setFormData] = useState<Partial<Sessao>>({
    data_hora: '',
    status: 'Pendente',
    paciente: undefined,
    responsavel: usuarioLogado!, 
    sessaoFases: [],
  });

  const [exercicioSelecionadoId, setExercicioSelecionadoId] = useState<string>('');

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

  function adicionarFase() {
    if (!exercicioSelecionadoId) return;

    const exercicioCompleto = listaExercicios.find(ex => ex.id === Number(exercicioSelecionadoId));
    if (!exercicioCompleto) return;

    const fasesAtuais = formData.sessaoFases || [];
    
    const novaFase: SessaoFase = {
      exercicio: exercicioCompleto,
      ordem: fasesAtuais.length + 1 
    };

    setFormData({
      ...formData,
      sessaoFases: [...fasesAtuais, novaFase]
    });

    setExercicioSelecionadoId(''); 
  }

  function removerFase(indexParaRemover: number) {
    const fasesAtuais = [...(formData.sessaoFases || [])];
    fasesAtuais.splice(indexParaRemover, 1);
    
    fasesAtuais.forEach((fase, index) => {
      fase.ordem = index + 1;
    });

    setFormData({ ...formData, sessaoFases: fasesAtuais });
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {sessaoParaAlterar ? 'Alterar Sessão' : 'Nova Sessão'}
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); onSalvar(formData as Sessao); }} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
            <input 
              type="datetime-local" required 
              value={formData.data_hora?.toString() || ''} 
              onChange={e => setFormData({...formData, data_hora: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Paciente</label>
            <select 
              required value={formData.paciente?.id || ''} 
              onChange={e => {
                const p = listaPacientes.find(p => p.id === Number(e.target.value));
                setFormData({ ...formData, paciente: p });
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecione um Paciente...</option>
              {listaPacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Roteiro da Sessão (Fases)</h3>
          
          <div className="flex gap-2 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Exercício / Ambiente Virtual</label>
              <select 
                value={exercicioSelecionadoId} 
                onChange={e => setExercicioSelecionadoId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Escolha um Exercício para Adicionar...</option>
                {listaExercicios.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nome} (Package: {ex.codigo_nome})
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              onClick={adicionarFase}
              disabled={!exercicioSelecionadoId}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              + Adicionar
            </button>
          </div>

          {formData.sessaoFases && formData.sessaoFases.length > 0 ? (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exercício</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pacote Unity</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.sessaoFases.map((fase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-bold text-gray-900 text-center w-16">
                        {fase.ordem}º
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {fase.exercicio.nome}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 font-mono text-xs">
                        {fase.exercicio.codigo_nome}
                      </td>
                      <td className="px-4 py-2 text-center w-24">
                        <button 
                          type="button" 
                          onClick={() => removerFase(index)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">Nenhum Exercício Adicionado a Esta Sessão.</p>
              <p className="text-xs text-gray-400 mt-1">Selecione um Exercício Acima e Clique em "Adicionar".</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onCancelar}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Voltar
          </button>
          <button type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Confirmar 
          </button>
        </div>

      </form>
    </div>
  );
}