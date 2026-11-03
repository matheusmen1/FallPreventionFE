import { api } from "./api";
import type {
  RelatorioEscalaDTO,
  RelatorioSessaoDTO,
  SalvarEscalaDTO,
} from "../features/sessao/types/relatorioSessao";

export const relatorioService = {
  getRelatorioPorSessao: async (sesId: number): Promise<RelatorioSessaoDTO> => {
    const response = await api.get<RelatorioSessaoDTO>(`/api/relatorios/sessao/${sesId}`);
    return response.data;
  },

  salvarEscalaFase: async (
    resfId: number,
    dados: SalvarEscalaDTO
  ): Promise<RelatorioEscalaDTO> => {
    const response = await api.post<RelatorioEscalaDTO>(
      `/api/relatorios/fase/${resfId}/escala`,
      dados
    );
    return response.data;
  },

  concluirSessao: async (
    sesId: number,
    observacao?: string
  ): Promise<RelatorioSessaoDTO> => {
    const response = await api.post<RelatorioSessaoDTO>(
      `/api/relatorios/sessao/${sesId}/concluir`,
      { observacao }
    );
    return response.data;
  },
};
