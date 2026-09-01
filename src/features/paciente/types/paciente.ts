import type { Doenca } from "../../doenca/types/doenca"

export interface Paciente{
    id?:number,
    nome:string,
    email:string,
    data_nascimento:string,
    telefone:string,
    cpf:string
    doenca?: Doenca,
    tipo_pessoa?:string
    observacao?:string
}