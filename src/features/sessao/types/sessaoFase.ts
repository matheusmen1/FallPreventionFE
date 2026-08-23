import type { Exercicio } from "../../exercicio/types/exercicio";
export interface SessaoFase {
  id?: number;
  exercicio: Exercicio;
  ordem: number;
  repeticao: number;
}