import { useState, useEffect } from 'react';
import type { Paciente } from '../types/paciente';
import type { Doenca } from '../../doenca/types/doenca';

interface FormProps 
{
  onCancelar: () => void;
  onSalvar: (paciente: Paciente) => void;
  pacienteParaAlterar?: Paciente | null;
  listaDoencas: Doenca[];
}

export const PERGUNTAS_FES_I = [
  "1. Limpar a casa.",
  "2. Vestir-se ou despir-se.",
  "3. Preparar refeições simples.",
  "4. Tomar banho.",
  "5. Ir às compras.",
  "6. Sentar-se ou levantar-se de uma cadeira.",
  "7. Subir ou descer escadas.",
  "8. Caminhar pela vizinhança.",
  "9. Alcançar um objeto acima da cabeça ou no chão.",
  "10. Atender o telefone antes que pare de tocar.",
  "11. Caminhar em superfície escorregadia.",
  "12. Visitar amigos ou parentes.",
  "13. Caminhar em local com muita gente.",
  "14. Caminhar em terreno irregular.",
  "15. Subir ou descer uma ladeira.",
  "16. Participar de eventos sociais."
];

export const OPCOES_RESPOSTA_FES_I = [
  { valor: 1, label: "1 - Nem um pouco preocupado" },
  { valor: 2, label: "2 - Um pouco preocupado" },
  { valor: 3, label: "3 - Moderadamente preocupado" },
  { valor: 4, label: "4 - Muito preocupado" }
];

export function obterClassificacaoFesI(pontuacao?: number) {
  const pts = pontuacao ?? 16;
  if (pts <= 16) {
    return {
      titulo: "Ausência de Preocupação",
      faixa: "16 pontos",
      niveisLiberados: "Iniciante, Leve, Moderado e Avançado",
      corBadge: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
  }
  if (pts <= 19) {
    return {
      titulo: "Baixa Preocupação",
      faixa: "17–19 pontos",
      niveisLiberados: "Iniciante, Leve e Moderado",
      corBadge: "bg-blue-100 text-blue-800 border-blue-200"
    };
  }
  if (pts <= 27) {
    return {
      titulo: "Preocupação Moderada",
      faixa: "20–27 pontos",
      niveisLiberados: "Iniciante e Leve",
      corBadge: "bg-amber-100 text-amber-800 border-amber-200"
    };
  }
  return {
    titulo: "Alta Preocupação com Quedas",
    faixa: "28–64 pontos",
    niveisLiberados: "Iniciante",
    corBadge: "bg-red-100 text-red-800 border-red-200"
  };
}

function distribuirPontuacaoEmRespostas(pontuacaoTotal?: number): number[] {
  const respostas = Array(16).fill(1);
  if (!pontuacaoTotal || pontuacaoTotal <= 16) return respostas;
  let restante = Math.min(64, pontuacaoTotal) - 16;
  for (let i = 0; i < 16 && restante > 0; i++) {
    const incremento = Math.min(3, restante);
    respostas[i] += incremento;
    restante -= incremento;
  }
  return respostas;
}

export function FormPaciente({ onCancelar, onSalvar, pacienteParaAlterar, listaDoencas }: FormProps) {
  const [passoAtual, setPassoAtual] = useState<number>(1);
  const [formData, setFormData] = useState<Paciente>({
    nome: '', cpf: '', email: '', telefone: '', data_nascimento: '', pontuacao: 16
  });
  const [respostasFesI, setRespostasFesI] = useState<number[]>(Array(16).fill(1));

  useEffect(() => {
    if (pacienteParaAlterar) {
      const pts = pacienteParaAlterar.pontuacao ?? 16;
      setFormData({
        ...pacienteParaAlterar,
        pontuacao: pts
      });
      setRespostasFesI(distribuirPontuacaoEmRespostas(pts));
    }
  }, [pacienteParaAlterar]);

  const pontuacaoCalculada = respostasFesI.reduce((acc, val) => acc + val, 0);
  const classificacao = obterClassificacaoFesI(pontuacaoCalculada);

  function atualizarRespostaItem(index: number, valor: number) {
    const novas = [...respostasFesI];
    novas[index] = valor;
    setRespostasFesI(novas);
    const soma = novas.reduce((acc, v) => acc + v, 0);
    setFormData(prev => ({ ...prev, pontuacao: soma }));
  }

  const mascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') 
      .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  const mascaraTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, ''); 
    if (v.length <= 10) {
      return v
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return v
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  function handleAvancarParaAnamnese(e: React.FormEvent) {
    e.preventDefault();
    setPassoAtual(2);
  }

  function handleConfirmarFinal(e: React.FormEvent) {
    e.preventDefault();
    onSalvar({
      ...formData,
      pontuacao: pontuacaoCalculada
    });
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          {pacienteParaAlterar ? 'Alterar Paciente' : 'Novo Paciente'}
        </h2>

        <div className="flex items-center space-x-3 text-sm">
          <div className={`flex items-center ${passoAtual >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>1</div>
            <span className="ml-2 font-medium">Dados Pessoais</span>
          </div>
          <div className={`w-10 h-1 rounded ${passoAtual >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${passoAtual === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 ${passoAtual === 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>2</div>
            <span className="ml-2 font-medium">Anamnese (FES-I Brasil)</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {passoAtual === 1 ? (
          <form onSubmit={handleAvancarParaAnamnese} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <input type="text" required minLength={14} value={formData.cpf} onChange={e => setFormData({...formData, cpf: mascaraCPF(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="text" required minLength={14} maxLength={15} value={formData.telefone} onChange={e => setFormData({...formData, telefone: mascaraTelefone(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Nascimento</label>
                <input type="date" required value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observação (Opcional)</label>
                <input type="text" value={formData.observacao || ''} onChange={e => setFormData({...formData, observacao: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Doença (Opcional)</label>
                <select  
                  value={formData.doenca?.id || ''} 
                  onChange={e => {
                    const idSelecionado = Number(e.target.value);
                    const doenca = listaDoencas.find(tipo => tipo.id === idSelecionado);
                    setFormData({ 
                      ...formData, 
                      doenca: doenca || undefined
                    });
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none bg-blue-50"
                >
                  <option value="">Selecione uma Doença...</option>
                  {listaDoencas.map(doenca => (
                    <option key={doenca.id} value={doenca.id}>
                      {doenca.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={onCancelar}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Voltar
              </button>
              <button type="submit"
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Próximo: Questionário FES-I →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmarFinal} className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  FES-I Brasil — Escala de Eficácia de Quedas Internacional
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Avalie a preocupação do paciente ({formData.nome}) em cair durante cada uma das 16 atividades da vida diária abaixo.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-gray-500 block">
                    Pontuação Total
                  </span>
                  <span className="text-2xl font-black text-blue-700">
                    {pontuacaoCalculada} <span className="text-xs font-normal text-gray-500">/ 64 pts</span>
                  </span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${classificacao.corBadge}`}>
                  <div>{classificacao.titulo} ({classificacao.faixa})</div>
                  <div className="font-normal text-[11px]">
                    Níveis liberados: <strong>{classificacao.niveisLiberados}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {PERGUNTAS_FES_I.map((pergunta, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors flex flex-col justify-between gap-2">
                  <label className="text-sm font-semibold text-gray-800">
                    {pergunta}
                  </label>
                  <select
                    value={respostasFesI[idx]}
                    onChange={e => atualizarRespostaItem(idx, Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    {OPCOES_RESPOSTA_FES_I.map(op => (
                      <option key={op.valor} value={op.valor}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setPassoAtual(1)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Voltar aos Dados
              </button>
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow transition-colors"
              >
                Confirmar Cadastro ({pontuacaoCalculada} pts)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
