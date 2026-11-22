import { api } from "./api";
import type { Configuracao } from "../features/configuracao/types/configuracao";

export const configuracaoService =
{
    getAll: async (): Promise<Configuracao[]> => {
        const response = await api.get<Configuracao[]>('/apis/configuracao');
        return response.data;
    },
    getById: async (id: number): Promise<Configuracao> => {
        const response = await api.get<Configuracao>(`/apis/configuracao/${id}`);
        return response.data;
    },
    add: async (configuracao: Configuracao): Promise<Configuracao> => {
        const response = await api.post<Configuracao>('/apis/configuracao', configuracao);
        return response.data;
    },
    put: async (configuracao: Configuracao): Promise<Configuracao> => {
        const response = await api.put<Configuracao>('/apis/configuracao', configuracao);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/apis/configuracao/${id}`);
    },
    getLocalIPv4: async (): Promise<string> => {
        const response = await api.get<string>('/apis/configuracao/getIPv4Local');
        return response.data;
    }
};