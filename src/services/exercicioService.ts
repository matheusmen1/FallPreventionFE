import { api } from "../services/api";
import type { Exercicio } from "../features/exercicio/types/exercicio";
export const exercicioService = 
{
    getAll: async (): Promise<Exercicio[]> =>
    {
        const response = await api.get('/apis/exercicio');
        return response.data
    },
    getAllByName: async (nome: string): Promise<Exercicio[]> =>
    {
        const response = await api.get(`/apis/exercicio/getAllByName/${nome}`);
        return response.data
    },
    add: async (exercicio: Exercicio): Promise<Exercicio> =>
    {
        const response = await api.post('/apis/exercicio', exercicio);
        return response.data;
    },
    put: async (exercicio: Exercicio): Promise<Exercicio> =>{
        const response = await api.put('/apis/exercicio', exercicio);
        return response.data;
    },
    delete: async (id: number): Promise<void> =>
    {
        await api.delete(`/apis/exercicio/${id}`)
    }
}