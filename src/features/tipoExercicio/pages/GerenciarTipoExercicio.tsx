import { useEffect, useState } from 'react';
import type { TipoExercicio } from '../types/tipoExercicio';
import { tipoExercicioService } from '../../../services/tipoExercicioService';
import { FormTipoExercicio } from '../components/FormTipoExercicio'; 

export function GerenciarTipoExercicio() 
{
  const [tiposExercicio, setTiposExercicio] = useState<TipoExercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [tipoExercicioEdicao, setTipoExercicioEdicao] = useState<TipoExercicio | null>(null);

  useEffect(() => {
    carregandoTipoExercicio();
  }, []);

  async function carregarTipoExercicioNome(nome: string)
  {
    try{
        const dados = await tipoExercicioService.getAllByName(nome)
        setTiposExercicio(dados)
    }catch(error){
        console.log("Erro ao Buscar Tipo de Exercício por Nome: ", error)
    }finally{
        setCarregando(false)
    }

  }
  async function carregandoTipoExercicio() {
    try {
      const dados = await tipoExercicioService.getAll();
      setTiposExercicio(dados);
    } catch (error) {
      console.error("Erro ao Buscar Tipo Exercício:", error);
    } finally {
      setCarregando(false);
    }
  }
  
  function onNovoTipoExercicio() 
  {
    setTipoExercicioEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(tipoExercicio: TipoExercicio)
{
    setTipoExercicioEdicao(tipoExercicio); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }

  async function salvar(tipoExercicioForm: TipoExercicio) 
  {
    try {
      if (tipoExercicioForm.id) {
        await tipoExercicioService.put(tipoExercicioForm);
      } else {
        await tipoExercicioService.add(tipoExercicioForm);
      }
      setExibirFormulario(false); 
      carregandoTipoExercicio(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(tipoExercicio: TipoExercicio)
{
    if (tipoExercicio.id == null) {
      alert("ID do tipo exercício inválido.");
      return;
    }

    try {
      if (tipoExercicio.id != null && confirm(`Tem Certeza que Deseja Excluir o Tipo de Exercício ${tipoExercicio.nome}?`))
      {
        await tipoExercicioService.delete(tipoExercicio.id);
        carregandoTipoExercicio(); 
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
            <FormTipoExercicio 
            onCancelar={onCancelar} 
            onSalvar={salvar} 
            tipoExercicioParaAlterar={tipoExercicioEdicao} 
            />
        </div>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Tipo de Exercício</h1>
        <button onClick={onNovoTipoExercicio} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Novo Tipo Exercício
        </button>
      </div>
        <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar Tipo de Exercício por Nome..."
          onChange={(e) => {if (e.target.value) {carregarTipoExercicioNome(e.target.value)} else {carregandoTipoExercicio()} }}
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) :tiposExercicio.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum Tipo de Exercício Encontrado.</td></tr>
            ) : (
              tiposExercicio.map((tipoExercicio) => (
                <tr key={tipoExercicio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipoExercicio.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(tipoExercicio)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(tipoExercicio)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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