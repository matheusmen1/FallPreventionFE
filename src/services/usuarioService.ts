import { api } from './api';
import type { Usuario } from '../features/usuario/types/usuario';

export const usuarioService = 
{
    getAll: async (): Promise<Usuario[]> => 
    {
        const response = await api.get('/apis/usuario');
        return response.data;
    },
    getMonitoresByResponsavel: async (idResponsavel: number): Promise<Usuario[]> =>
    {
        const response = await api.get(`/apis/usuario/getMonitoresByResponsavel/${idResponsavel}`);
        return response.data;
    },
    getAllFisioterapeutas: async (): Promise<Usuario[]> =>
    {
        const response = await api.get('/apis/usuario/getAllFisioterapeutas');
        return response.data;
    },
    add: async (usuario: Usuario): Promise<Usuario> => 
    {
        const response = await api.post('/apis/usuario', usuario);
        return response.data;
    },
    put: async (usuario: Usuario): Promise<Usuario> => 
    {
        const response = await api.put('/apis/usuario', usuario);
        return response.data;
    },
    delete: async (id: string): Promise<void> => 
    {
        await api.delete(`/apis/usuario/${id}`);
    }
};