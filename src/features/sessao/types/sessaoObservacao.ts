import type { SessaoFase } from "./sessaoFase";
export interface SessaoObservacao {
  id?: number;
  data_hora?: string;
  observacao: string;
  sessaoFase: SessaoFase;
}