import { api } from './api';
import type { TipoExercicio } from "../features/tipoExercicio/types/tipoExercicio";

export const tipoExercicioService = 
{
    getAll: async (): Promise<TipoExercicio[]> =>
    {
        const response = await api.get('/apis/tipo-exercicio');
        return response.data
    },
    getAllByName: async (nome: string): Promise<TipoExercicio[]> =>
    {
        const response = await api.get(`/apis/tipo-exercicio/getAllByName/${nome}`);
        return response.data
    },
    add: async (tipoExercicio: TipoExercicio): Promise<TipoExercicio> =>
    {
        const response = await api.post('/apis/tipo-exercicio', tipoExercicio);
        return response.data;
    },
    put: async (tipoExercicio: TipoExercicio): Promise<TipoExercicio> =>{
        const response = await api.put('/apis/tipo-exercicio', tipoExercicio);
        return response.data;
    },
    delete: async (id: number): Promise<void> =>
    {
        await api.delete(`/apis/tipo-exercicio/${id}`)
    }
}