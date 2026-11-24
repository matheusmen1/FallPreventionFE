import { useState, useEffect, useMemo } from 'react';
import type { Exercicio } from '../types/exercicio';
import type { TipoExercicio } from '../../tipoExercicio/types/tipoExercicio';
import { FeedbackCampo, classeBorda } from '../../../components/FeedbackCampo';
import { API_URL } from '../../../services/api';

interface FormProps 
{
  onCancelar: () => void;
  onSalvar: (dadosParaEnviar: FormData) => void;
  exercicioParaAlterar?: Exercicio | null;
  listaTipoExercicio: TipoExercicio[];
}

export const OPCOES_DIFICULDADE = [
  { valor: 1, label: 'Iniciante (28–64 Pontos FES-I)' },
  { valor: 2, label: 'Leve (20–27 Pontos FES-I)' },
  { valor: 3, label: 'Moderado (17–19 Pontos FES-I)' },
  { valor: 4, label: 'Avançado (16 Pontos FES-I)' },
];

export function obterInfoDificuldade(dificuldade?: number) {
  const nivel = dificuldade ?? 1;
  switch (nivel) {
    case 4:
      return {
        label: 'Avançado',
        corBadge: 'bg-red-100 text-red-800 border-red-200',
      };
    case 3:
      return {
        label: 'Moderado',
        corBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 2:
      return {
        label: 'Leve',
        corBadge: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 1:
    default:
      return {
        label: 'Iniciante',
        corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
  }
}

// Nome salvo no servidor: "<uuid>_<nome original>". Remove o prefixo para exibir só o nome original.
function nomeOriginalDoArquivo(url?: string): string | null {
  if (!url) return null;
  const nome = url.split('/').pop() || '';
  return nome.replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_/, '') || null;
}

interface CampoArquivoProps {
  accept: string;
  arquivoNovo: File | null;
  urlAtual?: string;
  onChange: (arquivo: File | null) => void;
}

// Input de arquivo que mostra o nome do arquivo escolhido ou, na edição, o nome do arquivo já salvo
function CampoArquivo({ accept, arquivoNovo, urlAtual, onChange }: CampoArquivoProps) {
  const nomeAtual = nomeOriginalDoArquivo(urlAtual);
  const nomeExibido = arquivoNovo ? arquivoNovo.name : nomeAtual ? `${nomeAtual} (atual)` : null;

  return (
    <label className="mt-1 flex w-full cursor-pointer items-center rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus-within:border-blue-500">
      <span className="mr-4 shrink-0 rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
        Escolher arquivo
      </span>
      <span className={`truncate text-sm ${nomeExibido ? 'text-gray-800' : 'text-gray-500'}`} title={nomeExibido ?? undefined}>
        {nomeExibido ?? 'Nenhum arquivo escolhido'}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={e => onChange(e.target.files?.[0] || null)}
        className="sr-only"
      />
    </label>
  );
}

export function FormExercicio({ onCancelar, onSalvar, exercicioParaAlterar, listaTipoExercicio }: FormProps) {
  const [formData, setFormData] = useState<Exercicio>({
    nome: '',
    descricao: '',
    tipo_exercicio: { id: 0, nome: '' },
    codigo_nome: '',
    dificuldade: 1
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  // Pré-visualização de um vídeo recém-selecionado (ainda não enviado)
  const urlNovoVideo = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : null), [videoFile]);
  useEffect(() => {
    return () => {
      if (urlNovoVideo) URL.revokeObjectURL(urlNovoVideo);
    };
  }, [urlNovoVideo]);
  const urlVideoAtual = formData.url_video ? `${API_URL}${formData.url_video}` : null;
  const videoExibido = urlNovoVideo ?? urlVideoAtual;

  const nomeOk = formData.nome.trim().length > 0;
  const descricaoOk = formData.descricao.trim().length > 0;
  const codigoOk = formData.codigo_nome.trim().length > 0;
  const categoriaOk = !!formData.tipo_exercicio?.id;
  const formularioValido = nomeOk && descricaoOk && codigoOk && categoriaOk;
  const handleSubmit = (e: React.FormEvent) =>
  {
    e.preventDefault();
    setTentouEnviar(true);
    if (!formularioValido) return;

    const pacote = new FormData();

    pacote.append(
      "exercicio", 
      new Blob([JSON.stringify({ ...formData, dificuldade: formData.dificuldade ?? 1 })], { type: "application/json" })
    );

    if (videoFile) pacote.append("video", videoFile);
    if (fotoFile) pacote.append("foto", fotoFile);

    onSalvar(pacote);
  };
  useEffect(() => {
    if (exercicioParaAlterar) {
      setFormData({
        ...exercicioParaAlterar,
        dificuldade: exercicioParaAlterar.dificuldade ?? 1
      });
    }
  }, [exercicioParaAlterar]);
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {exercicioParaAlterar ? 'Alterar Exercício' : 'Novo Exercício'}
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none ${classeBorda(tentouEnviar, nomeOk)}`} />
            <FeedbackCampo exibir={tentouEnviar} valido={nomeOk} mensagemErro="Informe o Nome." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição <span className="text-red-500">*</span></label>
            <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none ${classeBorda(tentouEnviar, descricaoOk)}`} />
            <FeedbackCampo exibir={tentouEnviar} valido={descricaoOk} mensagemErro="Informe a Descrição." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pacote Unity <span className="text-red-500">*</span></label>
            <input type="text" value={formData.codigo_nome} onChange={e => setFormData({...formData, codigo_nome: e.target.value})}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none ${classeBorda(tentouEnviar, codigoOk)}`} />
            <FeedbackCampo exibir={tentouEnviar} valido={codigoOk} mensagemErro="Informe o Pacote Unity." />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700">Categoria <span className="text-red-500">*</span></label>
              <select 
                value={formData.tipo_exercicio?.id || ''} 
                onChange={e => {
                  const idSelecionado = Number(e.target.value);
                  const tipoExercicioCompleto = listaTipoExercicio.find(tipo => tipo.id === idSelecionado);
                  setFormData({ 
                    ...formData, 
                    tipo_exercicio: tipoExercicioCompleto || { id: 0, nome: '' }
                  });
                }}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none bg-blue-50 ${classeBorda(tentouEnviar, categoriaOk)}`}
              >
                <option value="">Selecione uma Categoria...</option>
                {listaTipoExercicio.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
              <FeedbackCampo exibir={tentouEnviar} valido={categoriaOk} mensagemErro="Selecione uma Categoria." />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dificuldade <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.dificuldade ?? 1}
              onChange={e => setFormData({ ...formData, dificuldade: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none bg-blue-50"
            >
              {OPCOES_DIFICULDADE.map(op => (
                <option key={op.valor} value={op.valor}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Foto (Opcional)</label>
            <CampoArquivo accept="image/*" arquivoNovo={fotoFile} urlAtual={formData.url_foto} onChange={setFotoFile} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vídeo (Opcional)</label>
            <CampoArquivo accept="video/*" arquivoNovo={videoFile} urlAtual={formData.url_video} onChange={setVideoFile} />
            {videoExibido && (
              <div className="mt-3">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {urlNovoVideo ? 'Pré-visualização do Novo Vídeo' : 'Vídeo Atual'}
                </span>
                <video
                  key={videoExibido}
                  src={videoExibido}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-64 rounded-md bg-slate-900"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onCancelar}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Voltar
          </button>
          <button type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
}
