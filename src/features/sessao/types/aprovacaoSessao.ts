import type { Usuario } from "../../usuario/types/usuario";

export interface AprovacaoSessao {
    id?: number;
    motivo: string;
    status: string;
    fisioterapeuta: Usuario;
}