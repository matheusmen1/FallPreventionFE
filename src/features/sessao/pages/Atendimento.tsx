import { useState } from 'react';

export function Atendimento()
{
  // Simulação das sessões agendadas para o dia de hoje
  const [sessoesHoje, setSessoesHoje] = useState([
    {
      id: 1,
      paciente: { nome: 'Dona Maria Oliveira', idade: 72 },
      horario: '14:00',
      status_aprovacao: 'APROVADA',
      motivo_recusa: null,
      fases: [{ exercicio: { nome: 'Coleta no Parque VR', codigo_unity: 'com.unoeste.parquevr' }, ordem: 1 }]
    },
    {
      id: 2,
      paciente: { nome: 'Senhor Carlos Mendes', idade: 68 },
      horario: '15:00',
      status_aprovacao: 'PENDENTE',
      motivo_recusa: null,
      fases: [{ exercicio: { nome: 'Desvio de Obstáculos', codigo_unity: 'com.unoeste.desvio' }, ordem: 1 }]
    },
    {
      id: 3,
      paciente: { nome: 'Dona Ana Souza', idade: 75 },
      horario: '16:00',
      status_aprovacao: 'RECUSADA',
      motivo_recusa: 'Paciente relatou tontura leve ontem. Reduzir o roteiro para apenas 1 fase e reavaliar.',
      fases: [
        { exercicio: { nome: 'Coleta no Parque VR', codigo_unity: 'com.unoeste.parquevr' }, ordem: 1 },
        { exercicio: { nome: 'Desvio de Obstáculos', codigo_unity: 'com.unoeste.desvio' }, ordem: 2 }
      ]
    }
  ]);

  function iniciarSessaoVR(id: number, pacoteUnity: string) {
    if (confirm("Ligue o Quest 3S e posicione o paciente. Iniciar transmissão para o capacete?")) {
      console.log(`Iniciando sessão ${id}. Disparando via WebSocket para o pacote: ${pacoteUnity}`);
      // Aqui no futuro entrará a lógica do WebSocket: webSocketService.sendStartCommand(id)
      alert("Comando enviado para a Unity! Acompanhe o paciente.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Atendimentos de Hoje</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de execução do ambiente virtual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sessoesHoje.map(sessao => (
          <div key={sessao.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Cabeçalho do Card */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{sessao.paciente.nome}</h3>
                <p className="text-sm text-gray-500">{sessao.paciente.idade} anos • Agendado para {sessao.horario}</p>
              </div>
            </div>

            {/* Corpo - Resumo do Roteiro */}
            <div className="p-5 flex-1 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Roteiro VR</h4>
              <ul className="space-y-2">
                {sessao.fases.map(fase => (
                  <li key={fase.ordem} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">{fase.ordem}º</span>
                    {fase.exercicio.nome}
                  </li>
                ))}
              </ul>

              {/* Alerta de Recusa (Aparece apenas se recusado) */}
              {sessao.status_aprovacao === 'RECUSADA' && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
                  <span className="font-bold block mb-1">Ajuste Solicitado pelo Fisio:</span>
                  {sessao.motivo_recusa}
                </div>
              )}
            </div>

            {/* Rodapé - Trava de Segurança e Botão de Ação */}
            <div className="p-5 border-t border-gray-100 bg-white">
              {sessao.status_aprovacao === 'APROVADA' ? (
                <button 
                  onClick={() => iniciarSessaoVR(sessao.id, sessao.fases[0].exercicio.codigo_unity)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-lg shadow-md flex justify-center items-center gap-2"
                >
                  ▶ INICIAR SESSÃO NO ÓCULOS
                </button>
              ) : sessao.status_aprovacao === 'PENDENTE' ? (
                <button 
                  disabled
                  className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-lg cursor-not-allowed flex justify-center items-center gap-2 transition-all"
                >
                  🔒 Aguardando Liberação Médica
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 bg-red-100 text-red-400 font-bold rounded-lg cursor-not-allowed flex justify-center items-center gap-2 transition-all"
                >
                  ❌ Roteiro Bloqueado
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}