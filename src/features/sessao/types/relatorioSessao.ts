export interface RelatorioEscalaDTO {
  id?: number;
  nomeEscala: string;
  itemAvaliado?: string;
  pontuacao: number;
  justificativa?: string;
}

export interface RelatorioFaseDTO {
  resultadoFaseId: number;
  sessaoFaseId: number;
  ordem: number;
  exercicioNome: string;
  exercicioDescricao?: string;
  metaRepeticoes?: number;
  metaTempo?: number;
  isRepeticao?: boolean;
  repeticoesRealizadas?: number;
  tempoRealizado?: number;
  dataHoraInicio: string;
  dataHoraFim?: string;
  observacaoFase?: string;
  escala?: RelatorioEscalaDTO | null;
}

export interface RelatorioSessaoDTO {
  sessaoId: number;
  resultadoId?: number;
  sessaoStatus?: string;
  pacienteNome?: string;
  fisioterapeutaNome?: string;
  dataHoraInicio: string;
  dataHoraFim?: string;
  duracaoTotalMinutos?: number;
  observacao?: string;
  fases: RelatorioFaseDTO[];
}

export interface SalvarEscalaDTO {
  nomeEscala: string;
  itemAvaliado: string;
  pontuacao: number;
  justificativa?: string;
}
