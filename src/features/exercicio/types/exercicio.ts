import type { TipoExercicio } from "../../tipoExercicio/types/tipoExercicio";

export interface Exercicio{
    id?: number;
    nome: string;
    descricao: string;
    tipo_exercicio: TipoExercicio;
    codigo_nome: string;
    url_foto?: string;
    url_video?: string;
}