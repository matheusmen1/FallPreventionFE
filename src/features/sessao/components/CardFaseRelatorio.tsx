import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Repeat,
  Award,
  AlertCircle,
  Save,
  Activity,
  FileText,
} from "lucide-react";
import type {
  RelatorioEscalaDTO,
  RelatorioFaseDTO,
} from "../types/relatorioSessao";
import { relatorioService } from "../../../services/relatorioService";
import { GravacaoFase } from "./GravacaoFase";

interface CardFaseRelatorioProps {
  fase: RelatorioFaseDTO;
  gravacaoId?: number;
  somenteLeitura?: boolean;
  onEscalaAtualizada: (
    resultadoFaseId: number,
    novaEscala: RelatorioEscalaDTO
  ) => void;
}

export interface OpcaoNotaBerg {
  valor: number;
  descricao: string;
}

export interface ItemEscalaBerg {
  titulo: string;
  opcoes: OpcaoNotaBerg[];
}

export const CATALOGO_ESCALA_BERG: ItemEscalaBerg[] = [
  {
    titulo: "Não se Aplica",
    opcoes: [
      { valor: 4, descricao: "(4) Realiza a tarefa com total independência e segurança" },
      { valor: 3, descricao: "(3) Realiza a tarefa com independência, mas com leve adaptação ou supervisão" },
      { valor: 2, descricao: "(2) Realiza a tarefa parcialmente ou com supervisão próxima" },
      { valor: 1, descricao: "(1) Necessita de ajuda mínima para realizar a tarefa" },
      { valor: 0, descricao: "(0) Incapaz de realizar a tarefa (necessita de assistência moderada ou máxima)" },
    ],
  },
  {
    titulo: "9. APANHAR UM OBJETO DO CHÃO A PARTIR DA POSIÇÃO EM PÉ",
    opcoes: [
      { valor: 4, descricao: "(4) capaz de apanhar o chinelo facilmente e com segurança" },
      { valor: 3, descricao: "(3) capaz de apanhar o chinelo mas necessita supervisão" },
      { valor: 2, descricao: "(2) incapaz de apanhar o chinelo mas alcança 2-5cm do chinelo e mantém o equilíbrio de maneira independente" },
      { valor: 1, descricao: "(1) incapaz de apanhar e necessita supervisão enquanto tenta" },
      { valor: 0, descricao: "(0) incapaz de tentar / necessita assistência para evitar perda de equilíbrio ou queda" },
    ],
  },
  {
    titulo: "10. EM PÉ, VIRAR E OLHAR PARA TRÁS SOBRE OS OMBROS DIREITO E ESQUERDO",
    opcoes: [
      { valor: 4, descricao: "(4) olha para trás por ambos os lados com mudança de peso adequada" },
      { valor: 3, descricao: "(3) olha para trás por apenas um dos lados, o outro lado mostra menor mudança de peso" },
      { valor: 2, descricao: "(2) apenas vira para os dois lados mas mantém o equilíbrio" },
      { valor: 1, descricao: "(1) necessita de supervisão ao virar" },
      { valor: 0, descricao: "(0) necessita assistência para evitar perda de equilíbrio ou queda" },
    ],
  },
  {
    titulo: "11. VIRAR EM 360 GRAUS",
    opcoes: [
      { valor: 4, descricao: "(4) capaz de virar 360 graus com segurança em 4 segundos ou menos" },
      { valor: 3, descricao: "(3) capaz de virar 360 graus com segurança para apenas um lado em 4 segundos ou menos" },
      { valor: 2, descricao: "(2) capaz de virar 360 graus com segurança mas lentamente" },
      { valor: 1, descricao: "(1) necessita de supervisão ou orientação verbal" },
      { valor: 0, descricao: "(0) necessita de assistência enquanto vira" },
    ],
  },
];

export function encontrarItemCatalogo(itemSalvo?: string): ItemEscalaBerg {
  if (!itemSalvo) return CATALOGO_ESCALA_BERG[0];
  const exato = CATALOGO_ESCALA_BERG.find((i) => i.titulo === itemSalvo);
  if (exato) return exato;
  const numPrefix = itemSalvo.split(".")[0]?.trim();
  if (numPrefix && !isNaN(Number(numPrefix))) {
    const porNumero = CATALOGO_ESCALA_BERG.find((i) =>
      i.titulo.startsWith(numPrefix + ".")
    );
    if (porNumero) return porNumero;
  }
  return CATALOGO_ESCALA_BERG[0];
}

export function verificarExercicioNaoExecutado(fase: RelatorioFaseDTO): boolean {
  const rep = fase.repeticoesRealizadas ?? 0;
  const tempo = Number(fase.tempoRealizado ?? 0);

  if (rep === 0 && tempo === 0) {
    return true;
  }

  if (rep === 5 && tempo === 30) {
    return true;
  }

  if (!fase.isRepeticao && rep === 30 && tempo === Number(fase.metaTempo ?? 0)) {
    return true;
  }

  if (fase.isRepeticao && tempo === 5 && rep === (fase.metaRepeticoes ?? 0)) {
    return true;
  }

  return false;
}

export function CardFaseRelatorio({
  fase,
  gravacaoId,
  somenteLeitura = false,
  onEscalaAtualizada,
}: CardFaseRelatorioProps) {
  const naoExecutado = verificarExercicioNaoExecutado(fase);
  const [itemAvaliado, setItemAvaliado] = useState<string>(
    encontrarItemCatalogo(fase.escala?.itemAvaliado).titulo
  );
  const [pontuacao, setPontuacao] = useState<number>(
    fase.escala?.pontuacao ?? (naoExecutado ? 0 : 4)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const itemAtual = encontrarItemCatalogo(itemAvaliado);
  const opcaoSalva = itemAtual.opcoes.find(
    (op) => op.valor === (fase.escala?.pontuacao ?? pontuacao)
  );

  useEffect(() => {
    const faseNaoExecutada = verificarExercicioNaoExecutado(fase);
    setItemAvaliado(encontrarItemCatalogo(fase.escala?.itemAvaliado).titulo);
    setPontuacao(fase.escala?.pontuacao ?? (faseNaoExecutada ? 0 : 4));
    setErro(null);
    setMensagemSucesso(null);
  }, [fase]);

  async function handleSalvarEscala(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(null);

    try {
      setSalvando(true);
      const escalaSalva = await relatorioService.salvarEscalaFase(
        fase.resultadoFaseId,
        {
          nomeEscala: "Escala de Berg",
          itemAvaliado,
          pontuacao,
        }
      );

      onEscalaAtualizada(fase.resultadoFaseId, escalaSalva);
      setMensagemSucesso("Nota salva com sucesso!");
      setTimeout(() => setMensagemSucesso(null), 3500);
    } catch (err: any) {
      const msgBackend =
        err?.response?.data?.mensagem ||
        "Não foi possível salvar a nota desta fase.";
      setErro(msgBackend);
    } finally {
      setSalvando(false);
    }
  }

  function formatarHora(dataStr?: string) {
    if (!dataStr) return "--:--:--";
    return new Date(dataStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  const textoObservacaoFase =
    fase.observacaoFase ||
    fase.escala?.justificativa ||
    "Nenhuma Observação Registrada Para Este Exercício.";

  const mediaSegPorRep =
    fase.repeticoesRealizadas &&
    fase.repeticoesRealizadas > 0 &&
    fase.tempoRealizado
      ? (fase.tempoRealizado / fase.repeticoesRealizadas).toFixed(1)
      : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      <div className="bg-slate-50 px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-semibold text-xs">
            {fase.ordem}ª Exercício
          </span>
          <h3 className="text-base font-bold text-gray-800">
            {fase.exercicioNome}
          </h3>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
            {fase.isRepeticao ? "Por Repetição" : "Por Tempo"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <GravacaoFase
            gravacaoId={gravacaoId}
            titulo={`${fase.ordem}º Exercício — ${fase.exercicioNome}`}
          />
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={14} className="text-gray-400" />
            {formatarHora(fase.dataHoraInicio)} às {formatarHora(fase.dataHoraFim)}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 mb-3">
              <Repeat size={14} /> Meta Prescrita
            </span>
            {fase.isRepeticao ? (
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Repetições Prescritas</p>
                <p className="text-lg font-bold text-gray-800">
                  {fase.metaRepeticoes ?? 0} Repetições
                </p>
              </div>
            ) : (
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Tempo Prescrito</p>
                <p className="text-lg font-bold text-gray-800">
                  {fase.metaTempo ?? 0} Segundos
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-3">
              <Activity size={14} /> Executado no Ambiente Virtual
            </span>
            {naoExecutado ? (
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Execução no Ambiente Virtual</p>
                <p className="text-lg font-bold text-gray-500">Não se Aplica</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-500">
                    {fase.isRepeticao ? "Repetições Realizadas" : "Repetições no Tempo"}
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {fase.repeticoesRealizadas ?? 0} Repetições
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-500">
                    {fase.isRepeticao ? "Tempo que Demorou" : "Tempo Realizado"}
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {Number(fase.tempoRealizado ?? 0).toFixed(2)}s
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-500">Média por Repetição</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {mediaSegPorRep ? `${mediaSegPorRep}s / rep` : "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            <FileText size={14} className="text-blue-600" />
            Observação do Exercício
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {textoObservacaoFase}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award size={17} className="text-indigo-600" />
              <h4 className="text-sm font-bold text-gray-800">
                Escala de Equilíbrio de Berg
              </h4>
            </div>

            {fase.escala && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Pontuação: {fase.escala.pontuacao} / 4
              </span>
            )}
          </div>

          {somenteLeitura ? (
            <div className="bg-indigo-50/40 rounded-lg p-4 border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">
                  Item Avaliado
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {itemAtual.titulo}
                </p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">
                  Pontuação Atribuída
                </span>
                <p className="text-sm font-bold text-indigo-700">
                  {opcaoSalva
                    ? opcaoSalva.descricao
                    : `${fase.escala?.pontuacao ?? 0} / 4 pontos`}
                </p>
              </div>
            </div>
          ) : (
            <>
          
              <form
                onSubmit={handleSalvarEscala}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Item da Escala de Berg <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={itemAvaliado}
                    onChange={(e) => setItemAvaliado(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {CATALOGO_ESCALA_BERG.map((item) => (
                      <option key={item.titulo} value={item.titulo}>
                        {item.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pontuação (0 a 4) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pontuacao}
                    onChange={(e) => setPontuacao(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {itemAtual.opcoes.map((op) => (
                      <option key={op.valor} value={op.valor}>
                        {op.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save size={16} />
                    {salvando ? "Salvando..." : "Salvar Nota"}
                  </button>
                </div>
              </form>

              {erro && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <AlertCircle size={15} />
                  <span>{erro}</span>
                </div>
              )}

              {mensagemSucesso && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                  <CheckCircle2 size={15} />
                  <span>{mensagemSucesso}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
