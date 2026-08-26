import { useEffect, useState } from 'react';
import type { Sessao } from '../types/sessao';
import { sessaoService } from '../../../services/sessaoService';
import { useAuth } from '../../../contexts/AutoContext';
import { useNavigate } from 'react-router-dom';
export function Atendimento()
{
  useEffect(()=>{
    carregarSessoesAprovadas();
  }, [])

  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const { usuarioLogado } = useAuth();
  const navigate = useNavigate();
  async function carregarSessoesAprovadas()
  {
    try{
      const dados = await sessaoService.getAllByStatus("APROVADA");
      setSessoes(dados)
    }catch(error){
      console.log("Erro ao Carregar Sessões: ", error)
    }
  }
  async function iniciarSessao(idSessao: number)
  {
    if (usuarioLogado != null && usuarioLogado.id != null)
    try{
      const dados = await sessaoService.getById(idSessao);
      if (dados.responsavel.id === usuarioLogado.id)
      {
        navigate(`/sessao/execucao/${idSessao}`);
      }
      else
      {
        alert("Sessão Não Pertence ao Usuário Logado")
      }
    }catch(error){
      console.log("Erro ao Iniciar Sessão: ", error)
    }
  }
  function calcularIdade(dataNascimento: string): number
  {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mes = hoje.getMonth() - nascimento.getMonth();

    if (
      mes < 0 ||
      (mes === 0 && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
  }

  return idade;
}
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sessões Disponíveis</h1>
        </div>
      </div>
      {sessoes.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500">
          Nenhuma Sessão Disponível Encontrada.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {sessoes.map(sessao => (
          <div key={sessao.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{sessao.paciente.nome}</h3>
                <p className="text-sm text-gray-500">{calcularIdade(sessao.paciente.data_nascimento)} Anos • Agendado Para {new Date(sessao.data_hora).toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }  )}</p>
                
                <p className="text-sm text-gray-600">{sessao.responsavel.nome}</p>
              </div>
            </div>

            <div className="p-5 flex-1 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Atividade(s) Selecionada(s)</h4>
              <ul className="space-y-2">
                {sessao.sessaoFases
                  .slice()
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((fase) => (
                    <li key={fase.ordem} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm flex items-center gap-2">
                      <span className="bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">{fase.ordem}º</span>
                      {fase.exercicio.nome}
                      <span className="bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">{fase.exercicio.tipo_exercicio.nome}</span>
                      <span className="bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">Repetições: {fase.repeticao}</span>
                    </li>
                    
                  ))}
              </ul>
                    
            </div>
             <div className="p-6 flex-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Observações</h4>
                {sessao.observacao ? (
                  <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">{sessao.observacao}</p>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma Observação Encontrada.</p>
                )}
              </div>         
            <div className="p-5 border-t border-gray-100 bg-white">
             <button 
                  onClick={() => iniciarSessao(sessao.id!)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-lg shadow-md flex justify-center items-center gap-2"
                >
                  ABRIR SALA
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}