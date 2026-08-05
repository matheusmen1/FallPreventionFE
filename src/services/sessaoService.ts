import { api } from "./api";
import type { Sessao } from "../features/sessao/types/sessao";

export const sessaoService = {

    getAll: async (): Promise<Sessao[]> => {
        const response = await api.get('/apis/sessao');
        return response.data;
    },
    getAllByStatus: async (status: string): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/getAllByStatus/${status}`);
        return response.data;
    },
    getAllByResponsavelId: async (responsavelId: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/getAllByResponsavelId/${responsavelId}`);
        return response.data;
    },
    getAllByPacienteId: async (pacienteId: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/getAllByPacienteId/${pacienteId}`);
        return response.data;
    },
    add: async (sessao: Sessao): Promise<Sessao> => {
        const response = await api.post('/apis/sessao', sessao);
        return response.data;
    },
    put: async (sessao: Sessao): Promise<Sessao> => {
        const response = await api.put('/apis/sessao', sessao);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/apis/sessao/${id}`);
    }
}