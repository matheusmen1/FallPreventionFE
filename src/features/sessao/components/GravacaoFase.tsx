import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { sessaoService } from "../../../services/sessaoService";

interface GravacaoFaseProps {
  gravacaoId?: number;
  titulo?: string;
}

export function GravacaoFase({ gravacaoId, titulo }: GravacaoFaseProps) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!gravacaoId) return null;

  async function abrir() {
    setAberto(true);
    setErro(null);
    try {
      setCarregando(true);
      const blob = await sessaoService.playGravacao(gravacaoId!);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Erro ao carregar gravação da fase:", e);
      setErro("Não foi possível carregar a gravação.");
    } finally {
      setCarregando(false);
    }
  }

  function fechar() {
    setAberto(false);
    setUrl(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
      >
        <Video size={14} /> Ver Gravação
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">
                {titulo ?? "Gravação da Fase"}
              </h3>
              <button
                type="button"
                onClick={fechar}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="bg-black aspect-video flex items-center justify-center">
              {carregando && <span className="text-slate-300 text-sm">Carregando vídeo...</span>}
              {erro && <span className="text-red-300 text-sm">{erro}</span>}
              {url && (
                <video
                  src={url}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
