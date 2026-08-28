import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Sessao } from '../types/sessao';
import { sessaoService } from '../../../services/sessaoService';
import { PainelTransmissao } from './PainelTransmissao';
import { useNavigate } from 'react-router-dom';
import type { SessaoObservacao } from '../types/sessaoObservacao';
import { useSessao } from '../../../contexts/SessaoContext';
export function ExecucaoSessao() {
  const { id } = useParams();
  const [sessao, setSessao] = useState<Sessao>()
  const [cont, setCont] = useState(0);
  const navigate = useNavigate();
  const { carregarSessoesAprovadas } = useSessao();
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [isModalAbertoMensagem, setIsModalAbertoMensagem] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isSalvandoMensagem, setIsSalvandoMensagem] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [isSalvandoObservacao, setIsSalvandoObservacao] = useState(false);
  const [isGravando, setIsGravando] = useState(false);
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
            carregarSessao();
        }
    }catch(error){
        console.log("Erro ao Pausar Sessão: ", error)
    }
  }
  async function onRetomar()
  {
    try{
        if (id != null)
        {
            await sessaoService.retomar(Number.parseInt(id));
            carregarSessao();
        }
    }catch(error){
        console.log("Erro ao Retomar Sessão: ", error)
    }
  }
  async function onProximaFase() {
    try{
        if (id != null && cont < sessao?.sessaoFases.length!)
        {
          if (cont < sessao?.sessaoFases.length! - 1)  
          {
            await sessaoService.proximaFase(Number.parseInt(id));
            setCont(cont + 1);
            carregarSessao();
          }
          else
          {
            
            alert("Todas as Atividades Foram Concluídas.");
          }
        }
    }catch(error){
        console.log("Erro ao Avançar Fase: ", error)
    }
  }

  async function onIniciar()
  {
    try{
      await sessaoService.iniciar(Number.parseInt(id!));
      carregarSessao();
      carregarSessoesAprovadas();
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
  async function onReiniciarSessao()
  {
    try{
      if (sessao != null && sessao.id != null)
      {
        setCont(0);
        setIsGravando(false);
        //await sessaoService.retomar(sessao.id);
        await sessaoService.reiniciarSessao(sessao.id);
        carregarSessao();
      }
        

    }catch(error){
      console.log("Erro ao Reiniciar Sessão: ", error)
    }
  }
  async function onReiniciarExercicio()
  {
    try{
      {
        await sessaoService.reiniciarExercicio();
      }
    }catch(error){
      console.log("Erro ao Reiniciar Exercício: ", error)
    }
  }
  async function onSairSala()
  {
    try
    {
      if (sessao != null && sessao.id != null)
      {
      
       await sessaoService.sairSala(sessao.id);
       carregarSessoesAprovadas();
       navigate(`/atendimento`);
      }
      
      
    }catch(error){
      console.log("Erro ao Sair da Sala: ", error)
    }
  }
  async function onAddObservacao()
  {
    try{
      if (sessao != null && sessao.id != null && observacao.trim() !== "")
      {
        setIsSalvandoObservacao(true);
        const sessaoObservacao: SessaoObservacao = {
          
          observacao: observacao,
          sessaoFase: sessao.sessaoFases[cont]
        };
        await sessaoService.addObservacao(sessaoObservacao, sessao.id);
        setObservacao("");
        setIsSalvandoObservacao(false);
        setIsModalAberto(false);
      }
    }catch(error){
      console.log("Erro ao Salvar Observação: ", error)
    }
    finally {
      setIsSalvandoObservacao(false);
    }
  }
  async function onEnviarMensagem(mensagem: string)
  {
    try{
      if (mensagem.trim() !== "")
      {
        await sessaoService.enviarMensagem(mensagem);
        setMensagem("");
        setIsModalAbertoMensagem(false);
        setIsSalvandoObservacao(false);
      }
    }catch(error){
      console.log("Erro ao Enviar Mensagem: ", error)
    }
    finally {
      setIsSalvandoMensagem(false);
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
    <div className="flex h-[85vh] w-full bg-slate-900 font-sans overflow-hidden">
      

      <div className="w-[27.5%] bg-white h-full flex flex-col shadow-2xl z-10">
        
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{sessao?.paciente.nome}</h2>
            <p className="text-sm text-gray-500">{calcularIdade(sessao?.paciente.data_nascimento!)} anos</p>
            
          
          </div>
          <button onClick={onSairSala} className="text-red-500 text-sm font-bold hover:underline">
            Sair da Sala
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Intervenção(s) Clínica(s)</h3>
          <div className="space-y-3">
            {(() => {
              const faseAtual = Number((sessao as any)?.ordemAtual) || 0;
              const fasesOrdenadas = sessao?.sessaoFases?.sort((a, b) => a.ordem - b.ordem) || [];

              return fasesOrdenadas.map(fase => {
                const isAtiva = fase.ordem === faseAtual;
                const isPassada = fase.ordem < faseAtual;
                
                return (
                  <div key={fase.ordem} className={`p-4 rounded-lg border-2 transition-all ${
                    isAtiva ? 'border-blue-500 bg-blue-50 shadow-md' : 
                    isPassada ? 'border-green-200 bg-green-50 opacity-60' : 'border-gray-100 bg-white'
                  }`}>
                    
                   {fase.is_repeticao ? <span className={`font-bold ${isAtiva ? 'text-blue-700' : isPassada ? 'text-green-700' : 'text-gray-600'}`}>
                        {fase.ordem}º - {fase.exercicio.nome} - Repetições: {fase.repeticao}
                        
                      </span> : <span className={`font-bold ${isAtiva ? 'text-blue-700' : isPassada ? 'text-green-700' : 'text-gray-600'}`}>
                        {fase.ordem}º - {fase.exercicio.nome} - Tempo: {fase.tempo}s
                        
                      </span>}
                  <div className="flex justify-between items-center">
                      
                      {isAtiva && (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      )}
                      {isPassada && <span>✅</span>}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 font-mono">{fase.exercicio.tipo_exercicio.nome}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{fase.exercicio.codigo_nome}</p>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">

           <button 
            onClick={onIniciar}
            disabled={sessao?.status !== 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
             Iniciar Sessão
          </button>
             <button 
            onClick={onFinalizar}
            disabled={sessao?.status === 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
             Finalizar Sessão
          </button>
          <button 
            onClick={onReiniciarExercicio}
            disabled={sessao?.status === 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
             Reiniciar Exercício
          </button>
          <button 
            onClick={onReiniciarSessao}
            disabled={sessao?.status === 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
             Reiniciar Sessão
          </button>
             
          
         </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
          
          <button 
            onClick={onProximaFase}
            disabled={sessao?.status === 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
             Próxima Intervenção
          </button>

            <button 
              onClick={() => setIsModalAberto(true)}
              disabled={sessao?.status === 'APROVADA'}
              className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
              Adicionar Observação
            </button>
          
         
          <button 
            onClick={sessao?.status === 'PAUSADA' ? onRetomar : onPausar}
            disabled={sessao?.status !== 'EM_ANDAMENTO' && sessao?.status !== 'PAUSADA'}
            className="py-3 border-2 font-bold rounded-lg transition-all bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sessao?.status === 'PAUSADA' ? 'Retomar Intervenção' : 'Pausar Intervenção'}
          </button>

          <button 
            onClick={() => setIsGravando(!isGravando)} 
            disabled={sessao?.status !== 'EM_ANDAMENTO'}
            className={`py-3 border-2 font-bold rounded-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70 
              ${isGravando 
                ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' 
              }`}
          >
            {isGravando ? 'Parar Gravação' : 'Gravar Sessão'}
          </button>
          
        
        </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 grid grid-cols-1 gap-3">
            <button 
            onClick={() => setIsModalAbertoMensagem(true)}
            disabled={sessao?.status === 'APROVADA'}
            className=" py-3 border-2 font-bold rounded-lg transition-all  bg-white border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95   disabled:bg-slate-200   disabled:border-slate-300  disabled:text-slate-400 disabled:cursor-not-allowed   disabled:opacity-70 ">
            Enviar Mensagem
          </button>
        </div>
      </div>
            
    
      <div className="w-[75%] h-full flex flex-col items-center justify-center relative p-8">
        <PainelTransmissao isGravacao={isGravando} sessaoId={sessao?.id || 0} />
        <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          <span className="flex h-3 w-3 relative">
             {sessao?.status === 'EM_ANDAMENTO' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"> </span>
              </>
            )}
            {sessao?.status === 'PAUSADA' && (
              <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"> </span>
              </>
              
            )}
            {sessao?.status === 'APROVADA' && (
              <>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"> </span>
               
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              </>
            )}
          </span>
          {sessao?.status == 'APROVADA' && <span className="text-sm text-yellow-400 font-bold">Aguardando</span>}
          {sessao?.status == 'EM_ANDAMENTO' && <span className="text-sm text-green-400 font-bold">Em andamento</span>}
          {sessao?.status == 'PAUSADA' && <span className="text-sm text-red-400 font-bold">Pausada</span>}
         
        </div>

      </div>
      {isModalAberto && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Nova Observação
              </h3>
              <button 
                onClick={() => setIsModalAberto(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observação
              </label>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Digite sua Observação Aqui..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Sua Observação Será Adicionada à Sessão.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsModalAberto(false)}
                className="px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAddObservacao}
                disabled={isSalvandoObservacao || !observacao.trim()}
                className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSalvandoObservacao ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalAbertoMensagem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Nova Mensagem
              </h3>
              <button 
                onClick={() => setIsModalAbertoMensagem(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Digite sua Mensagem Aqui..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Sua Mensagem Será Enviada Para o Paciente.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsModalAbertoMensagem(false)}
                className="px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEnviarMensagem(mensagem);
                  
                }}
                disabled={isSalvandoMensagem || !mensagem.trim()}
                className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSalvandoMensagem ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}