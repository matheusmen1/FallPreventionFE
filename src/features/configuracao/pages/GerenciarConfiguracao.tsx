import { useEffect, useState } from 'react';
import type { Configuracao } from '../types/configuracao';
import { FormConfiguracao } from '../components/FormConfiguracao';
import { configuracaoService } from '../../../services/configuracaoService';

export function GerenciarConfiguracao() 
{
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [configuracaoEdicao, setConfiguracaoEdicao] = useState<Configuracao | null>(null);

  async function carregandoConfiguracao() {
    try {
      const dados = await configuracaoService.getAll();
      setConfiguracoes(dados);
    } catch (error) {
      console.error("Erro ao Buscar Configurações:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    obterIPv4Local();
    carregandoConfiguracao();
  }, []);

  function onAlterar(configuracao: Configuracao)
{
    setConfiguracaoEdicao(configuracao); 
    setExibirFormulario(true); 
  }

  function onCancelar()
{
    setExibirFormulario(false); 
  }
  async function obterIPv4Local() {
    try {
      await configuracaoService.getLocalIPv4();
    } catch (error) {
      console.error("Erro ao obter IPv4 Local:", error);

    }
  }
  async function salvar(configuracaoForm: Configuracao) 
  {
    try {
      if (configuracaoForm.id) {
        configuracaoForm.flag = true;
        await configuracaoService.put(configuracaoForm);
      }
      setExibirFormulario(false); 
      carregandoConfiguracao(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  }
  async function excluir(configuracao: Configuracao)
{
    if (configuracao.id == null) {
      alert("ID da configuração inválido.");
      return;
    }

    try {
      if (configuracao.id != null && confirm(`Tem Certeza que Deseja Excluir a Configuração ${configuracao.ip}?`))
      {
        await configuracaoService.delete(configuracao.id);
        carregandoConfiguracao(); 
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
            <FormConfiguracao 
            onCancelar={onCancelar} 
            onSalvar={salvar} 
            configuracaoParaAlterar={configuracaoEdicao} 
            />
        </div>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Configurações</h1>
      </div>
        
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPv4 Local</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carregando ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Carregando Dados...</td></tr>
            ) :configuracoes.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma Configuração Encontrada.</td></tr>
            ) : (
              configuracoes.map((configuracao) => (
                <tr key={configuracao.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{configuracao.ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                    <button onClick={() => onAlterar(configuracao)}  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-100">Alterar</button>
                    <button onClick={() => excluir(configuracao)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-100">Excluir</button>
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