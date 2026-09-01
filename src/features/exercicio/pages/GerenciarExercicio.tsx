import { useEffect, useState } from 'react';
import type { TipoExercicio } from '../../tipoExercicio/types/tipoExercicio';
import { tipoExercicioService } from '../../../services/tipoExercicioService';
import { FormExercicio } from '../components/FormExercicio';
import type { Exercicio } from '../types/exercicio';
import { exercicioService } from '../../../services/exercicioService';

export function GerenciarExercicio() 
{
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [listaTipoExercicio, setListaTipoExercicio] = useState<TipoExercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [exercicioEdicao, setExercicioEdicao] = useState<Exercicio | null>(null);

  useEffect(() => {
    carregandoExercicio();
    carregandoTipoExercicio();
  }, []);


  async function carregandoExercicio() {
    try {
      const dados = await exercicioService.getAll();
      setExercicios(dados);
    } catch (error) {
      console.error("Erro ao Buscar Exercício:", error);
    } finally {
      setCarregando(false);
    }
  }
  async function carregarExercicioNome(nome: string) {
    try {
      const dados = await exercicioService.getAllByName(nome);
      setExercicios(dados);
    } catch (error) {
      console.error("Erro ao Buscar Exercício:", error);
    } finally {
      setCarregando(false);
    }
  }
  async function carregandoTipoExercicio() 
  {
    try {
      const dados = await tipoExercicioService.getAll();
      setListaTipoExercicio(dados);
    } catch (error) {
      console.error("Erro ao Buscar Tipo Exercício:", error);
    } finally {
      setCarregando(false);
    }
  }
  
  function onNovoExercicio() 
  {
    setExercicioEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(exercicio: Exercicio)
{
    setExercicioEdicao(exercicio); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }

  async function salvar(dados: FormData) 
  {
    try {
      if (dados.get('id')) {
        await exercicioService.put(dados);
      } else {
        await exercicioService.add(dados);
      }
      setExibirFormulario(false); 
      carregandoExercicio(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(exercicio: Exercicio)
{
    if (exercicio.id == null) {
      alert("ID do exercício inválido.");
      return;
    }

    try {
      if (exercicio.id != null && confirm(`Tem Certeza que Deseja Excluir a Intervenção Clínica ${exercicio.nome}?`))
      {
        await exercicioService.delete(exercicio.id);
        carregandoExercicio(); 
      }
      
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir.");
    }
  }

  if (exibirFormulario) 
    {
        return (
        <div className="space-y-6">
            <FormExercicio 
            onCancelar={onCancelar} 
            onSalvar={salvar} 
            exercicioParaAlterar={exercicioEdicao}
            listaTipoExercicio={listaTipoExercicio}
            />
        </div>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Intervenções Clínicas</h1>
        <button onClick={onNovoExercicio} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Nova Intervenção Clínica
        </button>
      </div>
        <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar Intervenção Clínica por Nome..."
          onChange={(e) => {if (e.target.value) {carregarExercicioNome(e.target.value)} else {carregandoExercicio()} }}
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Intervenção Clínica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacote Unity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) :exercicios.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma Intervenção Clínica Encontrada.</td></tr>
            ) : (
              exercicios.map((exercicio) => (
                <tr key={exercicio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercicio.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercicio.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercicio.tipo_exercicio.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercicio.codigo_nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(exercicio)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(exercicio)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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