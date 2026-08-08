import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Sessao } from '../types/sessao';
import { sessaoService } from '../../../services/sessaoService';
import { PainelTransmissao } from './PainelTransmissao';

export function ExecucaoSessao() {
  const { id } = useParams();
  const [sessao, setSessao] = useState<Sessao>()

  useEffect(() => {
    carregarSessao();
   
  }, []);

  async function carregarSessao() 
  {
    try {
      if (id != null)
      {
        const dado = await sessaoService.getById(Number.parseInt(id));
        setSessao(dado)
      }
      
    } catch (error) {
      console.error("Erro ao carregar sessão: ", error);
    }
 }
  

  async function onPausar()
  {
    try{
        if (id != null)
        {
            await sessaoService.pausar(Number.parseInt(id));
        }
    }catch(error){
        console.log("Erro ao Pausar Sessão: ", error)
    }
  }

  async function onPularFase() {
    
  }

  async function onIniciar()
  {
    try{
      await sessaoService.iniciar(Number.parseInt(id!));
    }
    catch(error){
      alert("Conecte-se ao Meta Quest 3S Antes de Iniciar a Sessão")
      console.log("Erro ao Iniciar Sessão: ", error)
    }
  }
  function onFinalizar()
  {
    
    // navigate(`/atendimento/avaliacao/${sessao.id}`);
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
    <div className="flex h-[85vh] w-full bg-slate-900 font-sans overflow-hidden">
      

      <div className="w-[35%] bg-white h-full flex flex-col shadow-2xl z-10">
        
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{sessao?.paciente.nome}</h2>
            <p className="text-sm text-gray-500">Idade: {calcularIdade(sessao?.paciente.data_nascimento!)} anos | Sessão #{id}</p>
          </div>
          <button className="text-red-500 text-sm font-bold hover:underline">
            Sair da Sala
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ambiente(s) Virtuai(s)</h3>
          <div className="space-y-3">
            {sessao?.sessaoFases.map(fase => {
              const faseAtual = (sessao as any)?.faseAtual;
              const isAtiva = fase.ordem === faseAtual;
              const isPassada = fase.ordem < faseAtual;
              
              return (
                <div key={fase.ordem} className={`p-4 rounded-lg border-2 transition-all ${
                  isAtiva ? 'border-blue-500 bg-blue-50 shadow-md' : 
                  isPassada ? 'border-green-200 bg-green-50 opacity-60' : 'border-gray-100 bg-white'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${isAtiva ? 'text-blue-700' : isPassada ? 'text-green-700' : 'text-gray-600'}`}>
                      {fase.ordem}º - {fase.exercicio.nome}
                    </span>
                    {isAtiva && <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>}
                    {isPassada && <span>✅</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{fase.exercicio.codigo_nome}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
          
           <button 
            onClick={onIniciar}
            className="py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-all active:scale-95"
          >
             Iniciar
          </button>
          <button 
            onClick={onPausar}
            className="py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-all active:scale-95"
          >
            Pausar Fase
          </button>

          <button 
            onClick={onPularFase}
            className="py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-all active:scale-95"
          >
             Pular Fase
          </button>

          <button 
            onClick={onFinalizar}
            className="py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-all active:scale-95"
          >
             Finalizar Sessão
          </button>
        </div>
      </div>

    
      <div className="w-[65%] h-full flex flex-col items-center justify-center relative p-8">
        <PainelTransmissao />
        <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sessao?.status === 'EM_ANDAMENTO' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${sessao?.status === 'EM_ANDAMENTO' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          </span>
          <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">
            {sessao?.status === 'EM_ANDAMENTO' ? 'Conexão Ativa' : 'Em Pausa'}
          </span>
        </div>

      </div>

    </div>
  );
}