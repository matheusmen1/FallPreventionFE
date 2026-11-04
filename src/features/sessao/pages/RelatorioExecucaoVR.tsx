import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  User,
  Stethoscope,
  Award,
  AlertTriangle,
  ArrowLeft,
  Repeat,
  Activity,
  CheckCircle2,
} from "lucide-react";
import type {
  RelatorioEscalaDTO,
  RelatorioSessaoDTO,
} from "../types/relatorioSessao";
import type { Paciente } from "../../paciente/types/paciente";
import type { Sessao } from "../types/sessao";
import { relatorioService } from "../../../services/relatorioService";
import { pacienteService } from "../../../services/pacienteService";
import { sessaoService } from "../../../services/sessaoService";
import { useSessao } from "../../../contexts/SessaoContext";
import {
  CardFaseRelatorio,
  CATALOGO_ESCALA_BERG,
  encontrarItemCatalogo,
} from "../components/CardFaseRelatorio";

export function RelatorioExecucaoVR() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { atualizarSessoes, carregarSessoesAprovadas } = useSessao();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sessoesPaciente, setSessoesPaciente] = useState<Sessao[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<number | "">("");
  const [sessaoSelecionada, setSessaoSelecionada] = useState<number | "">(
    id ? Number(id) : ""
  );

  const [relatorio, setRelatorio] = useState<RelatorioSessaoDTO | null>(null);
  const [carregandoFiltros, setCarregandoFiltros] = useState<boolean>(false);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const [passoAtual, setPassoAtual] = useState<number>(1);
  const [itemBergPasso, setItemBergPasso] = useState<string>("Não se Aplica");
  const [pontuacaoPasso, setPontuacaoPasso] = useState<number>(4);
  const [observacaoGeralFinal, setObservacaoGeralFinal] = useState<string>("");
  const [salvandoPasso, setSalvandoPasso] = useState<boolean>(false);

  useEffect(() => {
    carregarPacientes();
  }, []);

  useEffect(() => {
    if (id) {
      const sesIdNum = Number(id);
      setSessaoSelecionada(sesIdNum);
      carregarRelatorioSessao(sesIdNum);
    }
  }, [id]);

  useEffect(() => {
    if (!relatorio) return;
    const idxFase = passoAtual - 1;
    if (idxFase >= 0 && idxFase < relatorio.fases.length) {
      const faseAtual = relatorio.fases[idxFase];
      setItemBergPasso(
        encontrarItemCatalogo(faseAtual.escala?.itemAvaliado).titulo
      );
      setPontuacaoPasso(faseAtual.escala?.pontuacao ?? 4);
    }
  }, [passoAtual, relatorio]);

  async function carregarPacientes() {
    try {
      setCarregandoFiltros(true);
      const lista = await pacienteService.getAll();
      setPacientes(lista);
    } catch (e) {
      console.error("Erro ao carregar pacientes:", e);
    } finally {
      setCarregandoFiltros(false);
    }
  }

  async function handleSelecionarPaciente(pacId: number | "") {
    setPacienteSelecionado(pacId);
    setSessaoSelecionada("");
    setRelatorio(null);
    setErro(null);

    if (pacId === "") {
      setSessoesPaciente([]);
      return;
    }

    try {
      setCarregandoFiltros(true);
      const sessoes = await sessaoService.getAllByPacienteId(pacId);
      setSessoesPaciente(sessoes);
    } catch (e) {
      console.error("Erro ao carregar sessões do paciente:", e);
    } finally {
      setCarregandoFiltros(false);
    }
  }

  async function carregarRelatorioSessao(sesId: number) {
    try {
      setCarregandoRelatorio(true);
      setErro(null);
      const dados = await relatorioService.getRelatorioPorSessao(sesId);
      setRelatorio(dados);
      setPassoAtual(1);
      setObservacaoGeralFinal(dados.observacao || "");
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensagem ||
        "Não foi possível carregar o relatório para esta sessão.";
      setErro(msg);
      setRelatorio(null);
    } finally {
      setCarregandoRelatorio(false);
    }
  }

  function handleEscalaFaseAtualizada(
    resultadoFaseId: number,
    novaEscala: RelatorioEscalaDTO
  ) {
    if (!relatorio) return;
    setRelatorio({
      ...relatorio,
      fases: relatorio.fases.map((f) =>
        f.resultadoFaseId === resultadoFaseId
          ? { ...f, escala: novaEscala }
          : f
      ),
    });
  }

  async function handleAvancarPassoFase() {
    if (!relatorio) return;
    const faseAtual = relatorio.fases[passoAtual - 1];
    if (!faseAtual) return;

    try {
      setSalvandoPasso(true);
      setErro(null);
      const escalaSalva = await relatorioService.salvarEscalaFase(
        faseAtual.resultadoFaseId,
        {
          nomeEscala: "Escala de Berg",
          itemAvaliado: itemBergPasso,
          pontuacao: pontuacaoPasso,
        }
      );
      handleEscalaFaseAtualizada(faseAtual.resultadoFaseId, escalaSalva);
      setPassoAtual((prev) => prev + 1);
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          "Erro ao salvar a nota desta fase."
      );
    } finally {
      setSalvandoPasso(false);
    }
  }

  async function handleConfirmarConcluirSessao() {
    if (!relatorio) return;
    try {
      setSalvandoPasso(true);
      setErro(null);
      const relatorioConcluido = await relatorioService.concluirSessao(
        relatorio.sessaoId,
        observacaoGeralFinal
      );
      setRelatorio(relatorioConcluido);
      try {
        atualizarSessoes();
        carregarSessoesAprovadas();
      } catch {}
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          "Erro ao concluir a sessão."
      );
    } finally {
      setSalvandoPasso(false);
    }
  }

  function formatarDataHora(data?: string) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarHora(dataStr?: string) {
    if (!dataStr) return "--:--:--";
    return new Date(dataStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  const fasesAvaliadas =
    relatorio?.fases.filter((f) => f.escala != null) ?? [];
  const somaPontosObtidos = fasesAvaliadas.reduce(
    (acc, f) => acc + (f.escala?.pontuacao ?? 0),
    0
  );

  function obterClassificacaoBerg(escore56: number, temAvaliacao: boolean) {
    if (!temAvaliacao) {
      return {
        texto: "Aguardando Avaliação das Intervenções",
        corClasses: "bg-gray-100 text-gray-600 border-gray-200",
      };
    }
    if (escore56 <= 20) {
      return {
        texto: "0 a 20 Pontos: Comprometimento Grave do Equilíbrio (Risco Alto de Quedas)",
        corClasses: "bg-red-100 text-red-800 border-red-200",
      };
    }
    if (escore56 <= 40) {
      return {
        texto: "21 a 40 Pontos: Equilíbrio Aceitável",
        corClasses: "bg-amber-100 text-amber-800 border-amber-200",
      };
    }
    return {
      texto: "41 a 56 Pontos: Bom Equilíbrio",
      corClasses: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  const classificacao = obterClassificacaoBerg(
    somaPontosObtidos,
    fasesAvaliadas.length > 0
  );

  const isSessaoConcluida =
    (relatorio?.sessaoStatus || "").toUpperCase() === "CONCLUIDA";

  const totalPassosWizard = (relatorio?.fases.length ?? 0) + 1;
  const faseDoPassoAtual =
    relatorio && passoAtual <= relatorio.fases.length
      ? relatorio.fases[passoAtual - 1]
      : null;
  const itemCatalogoPasso = encontrarItemCatalogo(itemBergPasso);

  return (
    <div className="space-y-6 pb-10">

      <div className="flex items-center gap-3">
        {id && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">
          {relatorio && !isSessaoConcluida
            ? "Finalizar Sessão"
            : "Relatório de Avaliação Clínica"}
        </h1>
      </div>

      {(!id || isSessaoConcluida) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Selecione o Paciente:
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-colors"
                value={pacienteSelecionado}
                onChange={(e) =>
                  handleSelecionarPaciente(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={carregandoFiltros}
              >
                <option value="">-- Selecione um Paciente --</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Selecione a Sessão:
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                value={sessaoSelecionada}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setSessaoSelecionada(val);
                  if (val !== "") {
                    carregarRelatorioSessao(val);
                  } else {
                    setRelatorio(null);
                  }
                }}
                disabled={carregandoFiltros || (pacienteSelecionado === "" && !id)}
              >
                <option value="">
                  {pacienteSelecionado === "" && !id
                    ? "-- Selecione o Paciente Primeiro --"
                    : sessoesPaciente.length === 0 && !id
                    ? "-- Nenhuma Sessão Encontrada --"
                    : "-- Escolha uma Sessão --"}
                </option>
                {sessoesPaciente.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sessão de {formatarDataHora(s.data_hora)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {carregandoRelatorio ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center text-gray-500 font-medium animate-pulse">
          Carregando dados da sessão...
        </div>
      ) : erro ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-center gap-3">
          <AlertTriangle size={22} className="shrink-0" />
          <p className="text-sm font-medium">{erro}</p>
        </div>
      ) : !relatorio ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center text-gray-400">
          Selecione um Paciente e uma Sessão Acima para Visualizar o Relatório.
        </div>
      ) : !isSessaoConcluida ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-8xl mx-auto">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              Avaliação Clínica — Paciente: {relatorio.pacienteNome}
            </h2>

            <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto">
              {relatorio.fases.map((f, idx) => {
                const numPasso = idx + 1;
                const ativo = passoAtual >= numPasso;
                return (
                  <div key={f.resultadoFaseId} className="flex items-center space-x-2">
                    <div
                      className={`flex items-center ${
                        ativo ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 text-sm ${
                          ativo
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {numPasso}
                      </div>
                      <span className="ml-1.5 font-medium text-xs hidden md:inline">
                        {f.ordem}ª Intervenção
                      </span>
                    </div>
                    <div
                      className={`w-6 md:w-10 h-1 rounded ${
                        passoAtual > numPasso ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  </div>
                );
              })}

              <div
                className={`flex items-center ${
                  passoAtual === totalPassosWizard
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 text-sm ${
                    passoAtual === totalPassosWizard
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {totalPassosWizard}
                </div>
                <span className="ml-1.5 font-medium text-xs hidden md:inline">
                  Conclusão
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {faseDoPassoAtual ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-sm">
                      {faseDoPassoAtual.ordem}ª Intervenção
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {faseDoPassoAtual.exercicioNome}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Modo:{" "}
                        {faseDoPassoAtual.isRepeticao
                          ? "Por Repetição"
                          : "Por Tempo"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <Clock size={14} className="text-gray-400" />
                    {formatarHora(faseDoPassoAtual.dataHoraInicio)} às{" "}
                    {formatarHora(faseDoPassoAtual.dataHoraFim)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 mb-3">
                      <Repeat size={14} /> Meta Prescrita
                    </span>
                    {faseDoPassoAtual.isRepeticao ? (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">
                          Repetições Prescritas
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {faseDoPassoAtual.metaRepeticoes ?? 0} Repetições
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Tempo Prescrito</p>
                        <p className="text-lg font-bold text-gray-800">
                          {faseDoPassoAtual.metaTempo ?? 0} Segundos
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-3">
                      <Activity size={14} /> Executado no Ambiente Virtual
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">
                          {faseDoPassoAtual.isRepeticao
                            ? "Repetições Realizadas"
                            : "Repetições no Tempo"}
                        </p>
                        <p className="text-lg font-bold text-emerald-700">
                          {faseDoPassoAtual.repeticoesRealizadas ?? 0} Repetições
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">
                          {faseDoPassoAtual.isRepeticao
                            ? "Tempo que Demorou"
                            : "Tempo Realizado"}
                        </p>
                        <p className="text-lg font-bold text-emerald-700">
                          {Number(faseDoPassoAtual.tempoRealizado ?? 0).toFixed(2)}s
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">
                          Média por Repetição
                        </p>
                        <p className="text-lg font-bold text-emerald-700">
                          {faseDoPassoAtual.repeticoesRealizadas &&
                          faseDoPassoAtual.repeticoesRealizadas > 0 &&
                          faseDoPassoAtual.tempoRealizado
                            ? `${(
                                faseDoPassoAtual.tempoRealizado /
                                faseDoPassoAtual.repeticoesRealizadas
                              ).toFixed(1)}s / rep`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    <FileText size={14} className="text-blue-600" />
                    Observação da Intervenção
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {faseDoPassoAtual.observacaoFase ||
                      faseDoPassoAtual.escala?.justificativa ||
                      "Nenhuma Observação Registrada Para Esta Intervenção."}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-indigo-600" />
                    <h4 className="text-base font-bold text-gray-800">
                      Escala de Equilíbrio de Berg
                    </h4>
                  </div>

              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1. Selecione o Item da Escala de Berg:
                      </label>
                      <select
                        value={itemBergPasso}
                        onChange={(e) => setItemBergPasso(e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {CATALOGO_ESCALA_BERG.map((item) => (
                          <option key={item.titulo} value={item.titulo}>
                            {item.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Selecione a Pontuação (0 a 4):
                      </label>
                      <select
                        value={pontuacaoPasso}
                        onChange={(e) =>
                          setPontuacaoPasso(Number(e.target.value))
                        }
                        className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {itemCatalogoPasso.opcoes.map((op) => (
                          <option key={op.valor} value={op.valor}>
                            {op.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Resumo da Sessão
                  </h3>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Escore da Escala de Berg (Máx. 56 pts)
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-indigo-700">
                        {somaPontosObtidos} / 56 pontos
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${classificacao.corClasses}`}
                  >
                    {classificacao.texto}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-700">
                    Pontuação Atribuída por Intervenção:
                  </h4>
                  <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {relatorio.fases.map((f) => (
                      <div
                        key={f.resultadoFaseId}
                        className="px-4 py-3 bg-white flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <div>
                          <span className="font-bold text-gray-800">
                            {f.ordem}ª {f.exercicioNome}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Item: {f.escala?.itemAvaliado || "Não Se Aplica"}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Pontos: {f.escala?.pontuacao ?? 0} / 4
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Observação Geral da Sessão (Opcional):
                  </label>
                  <textarea
                    rows={4}
                    value={observacaoGeralFinal}
                    onChange={(e) => setObservacaoGeralFinal(e.target.value)}
                    placeholder=""
                    className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div>
                {passoAtual > 1 && (
                  <button
                    type="button"
                    disabled={salvandoPasso}
                    onClick={() => setPassoAtual((prev) => prev - 1)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    ← Voltar
                  </button>
                )}
              </div>

              <div>
                {passoAtual < totalPassosWizard ? (
                  <button
                    type="button"
                    disabled={salvandoPasso}
                    onClick={handleAvancarPassoFase}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all cursor-pointer disabled:bg-blue-400"
                  >
                    {salvandoPasso ? "Salvando..." : "Próxima Intervenção →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={salvandoPasso}
                    onClick={handleConfirmarConcluirSessao}
                    className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg transition-all cursor-pointer disabled:bg-emerald-400"
                  >
                    {salvandoPasso
                      ? "Concluindo..."
                      : "Confirmar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-emerald-400" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                      Paciente
                    </span>
                    <span className="font-bold text-sm">
                      {relatorio.pacienteNome || "Não Informado"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-blue-400" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                      Responsável Pela Sessão
                    </span>
                    <span className="font-bold text-sm">
                      {relatorio.fisioterapeutaNome || "Não Informado"}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs text-slate-300">
                {formatarDataHora(relatorio.dataHoraInicio)}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <Clock size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Duração Total da Sessão
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {relatorio.duracaoTotalMinutos ?? 0} minutos
                    </p>
                    <p className="text-xs text-gray-400">
                      Início: {formatarDataHora(relatorio.dataHoraInicio)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                        <Award size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Escala de Berg
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold text-indigo-700">
                            {somaPontosObtidos} / 56 Pontos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${classificacao.corClasses}`}
                    >
                      {classificacao.texto}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  <FileText size={15} className="text-blue-600" />
                  Observação Geral da Sessão
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {relatorio.observacao ||
                    "Nenhuma Observação Registrada Para Esta Sessão."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Intervenções da Sessão ({relatorio.fases.length})
            </h2>

            {relatorio.fases.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
                Nenhuma fase registrada para esta sessão.
              </div>
            ) : (
              <div className="space-y-4">
                {relatorio.fases.map((fase) => (
                  <CardFaseRelatorio
                    key={fase.resultadoFaseId || fase.sessaoFaseId}
                    fase={fase}
                    somenteLeitura={true}
                    onEscalaAtualizada={handleEscalaFaseAtualizada}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
