import { useEffect, useState } from 'react';
import type { Paciente } from '../types/paciente';
import { pacienteService } from '../../../services/pacienteService';
import { FormPaciente } from '../components/FormPaciente'; 

export function GerenciarPaciente() 
{
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [pacienteEdicao, setPacienteEdicao] = useState<Paciente | null>(null);

  useEffect(() => {
    carregandoPacientes();
  }, []);

  async function carregarPacientesByName(nome: string)
  {
    try{
        const dados = await pacienteService.getByNome(nome)
        setPacientes(dados)

    }catch(error){
        console.log("Erro ao Buscar Paciente por Nome: ", error)
    }
    finally{
        setCarregando(false)
    }
  }
  async function carregandoPacientes() {
    try {
      const dados = await pacienteService.getAll();
      setPacientes(dados);
    } catch (error) {
      console.error("Erro ao Buscar Pacientes:", error);
    } finally {
      setCarregando(false);
    }
  }
  
  function onNovoPaciente() 
  {
    setPacienteEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(paciente: Paciente)
{
    setPacienteEdicao(paciente); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }

  async function salvar(pacienteForm: Paciente) 
  {
    try {
      if (pacienteForm.id) {
        await pacienteService.put(pacienteForm);
      } else {
        await pacienteService.add(pacienteForm);
      }
      setExibirFormulario(false); 
      carregandoPacientes(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(paciente: Paciente)
{
    if (paciente.id == null) {
      alert("ID do paciente inválido.");
      return;
    }

    try {
      if (paciente.id != null && confirm(`Tem Certeza que Deseja Excluir o Paciente ${paciente.nome}?`))
      {
        await pacienteService.delete(paciente.id);
        carregandoPacientes(); 
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
            <FormPaciente 
            onCancelar={onCancelar} 
            onSalvar={salvar} 
            pacienteParaAlterar={pacienteEdicao} 
            />
        </div>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Pacientes</h1>
        <button onClick={onNovoPaciente} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Novo Paciente
        </button>
      </div>
        <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar Paciente por Nome..."

          onChange={(e) => {if (e.target.value) {carregarPacientesByName(e.target.value)} else {carregandoPacientes()} }}
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) :pacientes.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum Paciente Encontrado.</td></tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paciente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(paciente)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(paciente)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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