import { api} from './api';
import type { Doenca } from "../features/doenca/types/doenca";

export const doencaService =
{
    getAll: async (): Promise<Doenca[]> =>
    {
        const response = await api.get('/apis/doenca');
        return response.data
    },
    getAllByName: async (nome: string): Promise<Doenca[]> =>
    {
        const response = await api.get(`/apis/doenca/getAllByName/${nome}`);
        return response.data
    },
    add: async (doenca: Doenca): Promise<Doenca> =>
    {
        const response = await api.post('/apis/doenca', doenca);
        return response.data;
    },
    put: async (doenca: Doenca): Promise<Doenca> =>{
        const response = await api.put('/apis/doenca', doenca);
        return response.data;
    },
    delete: async (id: number): Promise<void> =>
    {
        await api.delete(`/apis/doenca/${id}`)
    }
}