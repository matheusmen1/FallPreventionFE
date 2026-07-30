import { api } from './api';
import type { Paciente } from '../features/paciente/types/paciente';

export const pacienteService =
{
    getAll: async (): Promise<Paciente[]> =>
    {
        const response = await api.get('/apis/paciente');
        return response.data
    },
    getById: async (id:number): Promise<Paciente> =>
    {
        const response = await api.get(`/apis/paciente/${id}`);
        return response.data
    },
    getByCpf: async (cpf:string): Promise<Paciente> =>
    {
        const response = await api.get(`/apis/paciente/getByCpf/${cpf}`);
        return response.data
    },
    getByNome: async (nome:string): Promise<Paciente[]> =>
    {
        const response = await api.get(`/apis/paciente/getByNome/${nome}`)
        return response.data
    },
    add: async (paciente: Paciente): Promise<Paciente> =>
    {
        const response = await api.post('/apis/paciente', paciente)
        return response.data
    },
    put: async (paciente: Paciente): Promise<Paciente> =>
    {
        const response = await api.put('/apis/paciente', paciente)
        return response.data
    },
    delete: async (id:number): Promise<void> =>
    {
        await api.delete(`/apis/paciente/${id}`)
    }


}