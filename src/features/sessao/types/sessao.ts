import type { Usuario } from "../../usuario/types/usuario";
import type { Paciente } from "../../paciente/types/paciente";
import type { SessaoFase } from "./sessaoFase";
import type { AprovacaoSessao } from "./aprovacaoSessao";

export interface Sessao{
    id?: number;
    data_hora: string;
    responsavel: Usuario;
    paciente: Paciente;
    status: string;
    sessaoFases: SessaoFase[];
    aprovacaoSessao: AprovacaoSessao;
    ordemAtual?: number; 
}