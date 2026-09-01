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
    add: async (dados: FormData): Promise<Exercicio> =>
    {
        const response = await api.post('/apis/exercicio', dados, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    put: async (dados: FormData): Promise<Exercicio> =>{
        const response = await api.put('/apis/exercicio', dados, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    delete: async (id: number): Promise<void> =>
    {
        await api.delete(`/apis/exercicio/${id}`)
    }
}