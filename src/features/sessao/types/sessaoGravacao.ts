export interface SessaoGravacao {
    id: number;
    data_hora: string;
    sessaoFaseId?: number;
    ordem?: number;
    exercicioNome?: string;
}
