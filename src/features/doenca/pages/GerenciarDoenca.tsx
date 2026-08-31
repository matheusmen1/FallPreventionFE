import { useEffect, useState } from 'react';
import type { Doenca } from '../types/doenca';
import { doencaService } from '../../../services/doenca';
import { FormDoenca } from '../components/FormDoenca';

export function GerenciarDoenca() 
{
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [doencaEdicao, setDoencaEdicao] = useState<Doenca | null>(null);

  async function carregandoDoencas() {
    try {
      const dados = await doencaService.getAll();
      setDoencas(dados);
    } catch (error) {
      console.error("Erro ao Buscar Doenças:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregandoDoencas();
  }, []);

  async function carregandoDoencasNome(nome: string)
  {
    try{
        const dados = await doencaService.getAllByName(nome)
        setDoencas(dados)
    }catch(error){
        console.log("Erro ao Buscar Doenças por Nome: ", error)
    }finally{
        setCarregando(false)
    }

  }
  
  function onNovaDoenca() 
  {
    setDoencaEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(doenca: Doenca)
{
    setDoencaEdicao(doenca); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }

  async function salvar(doencaForm: Doenca) 
  {
    try {
      if (doencaForm.id) {
        await doencaService.put(doencaForm);
      } else {
        await doencaService.add(doencaForm);
      }
      setExibirFormulario(false); 
      carregandoDoencas(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(doenca: Doenca)
{
    if (doenca.id == null) {
      alert("ID da doença inválido.");
      return;
    }

    try {
      if (doenca.id != null && confirm(`Tem Certeza que Deseja Excluir a Doença ${doenca.nome}?`))
      {
        await doencaService.delete(doenca.id);
        carregandoDoencas(); 
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
            <FormDoenca 
            onCancelar={onCancelar} 
            onSalvar={salvar} 
            doencaParaAlterar={doencaEdicao} 
            />
        </div>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Doenças</h1>
        <button onClick={onNovaDoenca} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Nova Doença
        </button>
      </div>
        <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar Doença por Nome..."
          onChange={(e) => {if (e.target.value) {carregandoDoencasNome(e.target.value)} else {carregandoDoencas()} }}
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
            ) :doencas.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma Doença Encontrada.</td></tr>
            ) : (
              doencas.map((doenca) => (
                <tr key={doenca.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doenca.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(doenca)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(doenca)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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