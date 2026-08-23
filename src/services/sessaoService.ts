import { api } from "./api";
import type { Sessao } from "../features/sessao/types/sessao";
import type { AprovacaoSessao } from "../features/sessao/types/aprovacaoSessao";
import type { SessaoObservacao } from "../features/sessao/types/sessaoObservacao";
import type { SessaoGravacao } from "../features/sessao/types/sessaoGravacao";
export const sessaoService = {

    getAll: async (): Promise<Sessao[]> => {
        const response = await api.get('/apis/sessao');
        return response.data;
    },
    getAllByStatus: async (status: string): Promise<Sessao[]> =>{
        const response = await api.get(`/apis/sessao/status/${status}`)
        return response.data;
    },
    getAllByStatusId: async (status: string, id: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/status/${status}/${id}`);
        return response.data;
    },
    getAllPendenteByFisioterapeutaId: async (fisioterapeutaId: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/pendentes/${fisioterapeutaId}`);
        return response.data;
    },
    getAllByResponsavelId: async (responsavelId: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/getAllByResponsavelId/${responsavelId}`);
        return response.data;
    },
    getAllByPacienteId: async (pacienteId: number): Promise<Sessao[]> => {
        const response = await api.get(`/apis/sessao/getAllByPaciente/${pacienteId}`);
        return response.data;
    },
    getAllObservacoesByPacienteAndSessao: async (sessaoId: number, pacienteId: number): Promise<SessaoObservacao[]> => {
        const response = await api.get(`/apis/sessao/getAllObservacoesByPacienteAndSessao/${sessaoId}/${pacienteId}`);
        return response.data;
    },
    getById: async (id: number): Promise<Sessao> => {
        const response = await api.get(`/apis/sessao/${id}`);
        return response.data;
    },
    add: async (sessao: Sessao): Promise<Sessao> => {
        const response = await api.post('/apis/sessao', sessao);
        return response.data;
    },
    addObservacao: async (sessaoObservacao: SessaoObservacao, idSessaoFase: number): Promise<void> => {
        await api.post(`/apis/sessao/observacao/${idSessaoFase}`, sessaoObservacao);
    },
    put: async (sessao: Sessao): Promise<Sessao> => {
        const response = await api.put('/apis/sessao', sessao);
        return response.data;
    },
    aprovarSessao: async (aprovacaoSessao: AprovacaoSessao, idSessao: number): Promise<AprovacaoSessao> =>{
        const response = await api.put(`/apis/sessao/aprovar/${idSessao}`, aprovacaoSessao)
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/apis/sessao/${id}`);
    },
    deleteObservacao: async (id: number): Promise<void> => {
        await api.delete(`/apis/sessao/observacao/${id}`);
    },
    deleteGravacao: async (id: number): Promise<void> => {
        await api.delete(`/apis/sessao/gravacao/${id}`);
    },
    pausar: async (id: number): Promise<void> =>{
        await api.put(`/apis/sessao/pausar/${id}`)
    },
    iniciar: async (id: number): Promise<void> =>{
        await api.put(`/apis/sessao/iniciar/${id}`)
    },
    sairSala: async (id: number): Promise<void> =>{
        await api.put(`/apis/sessao/sairSala/${id}`)
    },
    proximaFase: async (id: number): Promise<void> =>{
        await api.put(`/apis/sessao/proxima/${id}`)
    }, 
    retomar: async (id: number): Promise<void> =>{
        await api.put(`/apis/sessao/retomar/${id}`)
    },
    getAllGravacoesBySessao: async (sessaoId: number, pacienteId: number): Promise<SessaoGravacao[]> => {
        const response = await api.get(`/apis/sessao/gravacoes/${sessaoId}/${pacienteId}`);
        return response.data;
    },
    addGravacao: async (sessaoId: number, videoBlob: Blob): Promise<void> => {
        const formData = new FormData();
        formData.append('video', videoBlob, `gravacao_${sessaoId}.webm`);
        await api.post(`/apis/sessao/gravacao/${sessaoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    playGravacao: async (gravacaoId: number): Promise<Blob> => {
        const response = await api.get(`/apis/sessao/gravacao/play/${gravacaoId}`, {
            responseType: 'blob',
        });
        return response.data;
    },
    enviarMensagem: async (mensagem: string): Promise<void> => {
        await api.put(`/apis/sessao/mensagem/${mensagem}`);
    },
    reiniciarSessao: async (sessaoId: number): Promise<void> => {
        await api.put(`/apis/sessao/reiniciar/${sessaoId}`);
    },
    reiniciarExercicio: async (): Promise<void> => {
        await api.put(`/apis/sessao/reiniciar-exercicio`);
    }
}