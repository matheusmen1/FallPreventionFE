export interface Usuario{
    id?:number,
    cpf:string,
    nome:string,
    senha:string,
    email:string,
    telefone:string,
    ra:string,
    nivel:number,
    responsavel?:Usuario
}