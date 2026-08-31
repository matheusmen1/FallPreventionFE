import { useEffect, useState } from 'react';
import type { Usuario } from '../types/usuario';
import { usuarioService } from '../../../services/usuarioService';
import { FormUsuario } from '../components/FormUsuario'; 
import { useAuth } from '../../../contexts/AutoContext';
export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);

  const { usuarioLogado } = useAuth();

  const [btSelecionado, setBtSelecionado] = useState(false);
  useEffect(() => {
    carregandoUsuarios();
    carregarFisioterapeutas();
  }, []);

  async function carregandoUsuarios() {
    try {
      const dados = await usuarioService.getAll();
      setUsuarios(dados);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setCarregando(false);
    }
  }
  
  async function carregarFisioterapeutas(){
    try {
      const dados = await usuarioService.getAllFisioterapeutas();
      setFisioterapeutas(dados);
    } catch (error) {
      console.error("Erro ao buscar fisioterapeutas:", error);
    } finally {
      setCarregando(false);
    }
  }

  function onNovoUsuario() 
  {
    setUsuarioEmEdicao(null); 
    setExibirFormulario(true); 
  }

  function onAlterar(usuario: Usuario)
{
    setUsuarioEmEdicao(usuario); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }

  async function buscarMonitoresById()
  {
    try{
      if (usuarioLogado)
      {
        const dados = await usuarioService.getMonitoresByResponsavel(usuarioLogado)
        setUsuarios(dados)
      }
      
    }catch(error){
      console.log("Erro ao buscar: ", error)
    }
    finally{
      setCarregando(false);
    }
  }
  async function salvar(usuarioForm: Usuario) {
    try {
      if (usuarioForm.id) {
        await usuarioService.put(usuarioForm);
      } else {
        await usuarioService.add(usuarioForm);
      }
      setExibirFormulario(false); 
      carregandoUsuarios(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(usuario: Usuario)
{
    if (usuario.id == null) {
      alert("ID do usuário inválido.");
      return;
    }

    try {
      if (usuario.id != null && confirm(`Tem Certeza que Deseja Excluir o Usuário ${usuario.nome}?`))
      {
        await usuarioService.delete(usuario.id.toString());
        carregandoUsuarios(); 
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
        <FormUsuario 
          onCancelar={onCancelar} 
          onSalvar={salvar} 
          usuarioParaAlterar={usuarioEmEdicao}
          listaFisioterapeutas={fisioterapeutas} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
        <button onClick={onNovoUsuario} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-colors font-medium">
          + Novo Usuário
        </button>
        
      </div>
      <div className="mb-4">
      
        <button
        onClick={() => {setBtSelecionado(!btSelecionado); if(!btSelecionado) buscarMonitoresById(); else carregandoUsuarios();}}
        className={`px-4 py-2 rounded-md transition-all ${
          btSelecionado
            ? "bg-blue-800 text-white shadow-inner scale-95"
            : "bg-blue-600 text-white shadow hover:bg-blue-700"
        }`}
      >
        Meus Monitores
      </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA/Matrícula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum Usuário Encontrado.</td></tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.cpf}</td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.ra}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.nivel === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {usuario.nivel === 1 ? 'Fisioterapeuta' : 'Monitor'}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.responsavel ? usuario.responsavel.nome : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(usuario)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(usuario)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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