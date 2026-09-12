import type { Sessao } from "../../sessao/types/sessao";
export interface Usuario{
    id?:number,
    usr_responsavel_id?: number,
    cpf:string,
    nome:string,
    senha:string,
    email:string,
    telefone:string,
    ra:string,
    nivel:number,
    responsavel?:Usuario,
    sessoesAutorizadas?: Sessao[]
}