import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Paciente } from '../types/paciente';
import { pacienteService } from '../../../services/pacienteService';
import { FormPaciente, obterClassificacaoFesI } from '../components/FormPaciente'; 
import type { Doenca } from '../../doenca/types/doenca';
import { doencaService } from '../../../services/doencaService'
function formatarData(data?: string): string {
  if (!data) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(data);
  return isNaN(d.getTime()) ? data : d.toLocaleDateString('pt-BR');
}

export function GerenciarPaciente() 
{
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [pacienteEdicao, setPacienteEdicao] = useState<Paciente | null>(null);
  const [pacienteDetalhe, setPacienteDetalhe] = useState<Paciente | null>(null);
  const [listaDoencas, setListaDoencas] = useState<Doenca[]>([]); 
  useEffect(() => {
    carregandoPacientes();
    carregarDoencas();
  }, []);

  async function carregarDoencas()
  {
    try{
      const dados = await doencaService.getAll();
      setListaDoencas(dados);
    } catch (error) {
      console.error("Erro ao carregar doenças:", error);
    }
  }
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
            listaDoencas={listaDoencas}
            onDoencaCriada={(novaDoenca) => setListaDoencas((prev) => [...prev, novaDoenca])}
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
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) :pacientes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum Paciente Encontrado.</td></tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paciente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.cpf}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => setPacienteDetalhe(paciente)} className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-100">Ver Mais</button>
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
      {pacienteDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPacienteDetalhe(null)}>
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-3">
              <h3 className="text-lg font-bold text-gray-800 truncate">{pacienteDetalhe.nome}</h3>
              <button
                type="button"
                onClick={() => setPacienteDetalhe(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</span>
                <span className="text-gray-900">{formatarData(pacienteDetalhe.data_nascimento)}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</span>
                <span className="text-gray-900">{pacienteDetalhe.sexo}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">FES-I</span>
                <span className={`inline-block mt-0.5 px-2.5 py-1 rounded-full text-xs font-bold border ${obterClassificacaoFesI(pacienteDetalhe.pontuacao).corBadge}`}>
                  {pacienteDetalhe.pontuacao ?? 16} Pontos — {obterClassificacaoFesI(pacienteDetalhe.pontuacao).titulo}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Doença</span>
                <span className="text-gray-900">{pacienteDetalhe.doenca?.nome || 'Nenhuma'}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</span>
                <span className="text-gray-900 whitespace-pre-wrap">{pacienteDetalhe.observacao || 'Nenhuma'}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPacienteDetalhe(null)}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
