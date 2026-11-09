import type { SessaoFase } from '../types/sessaoFase';
import { API_URL } from '../../../services/api';
import { obterInfoDificuldade } from '../../exercicio/components/FormExercicio';

interface ModalDetalhesExercicioProps {
  fase: SessaoFase | null;
  onFechar: () => void;
}

export function ModalDetalhesExercicio({ fase, onFechar }: ModalDetalhesExercicioProps) {
  if (!fase) return null;

  const { exercicio } = fase;
  const infoDif = obterInfoDificuldade(exercicio.dificuldade);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col md:flex-row border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 bg-slate-900 relative flex items-center justify-center min-h-[300px]">
          {exercicio.url_video ? (
            <video
              src={`${API_URL}${exercicio.url_video}`}
              className="w-full h-full object-cover min-h-[300px] max-h-[450px]"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          ) : exercicio.url_foto ? (
            <img
              src={`${API_URL}${exercicio.url_foto}`}
              className="w-full h-full object-cover min-h-[300px] max-h-[450px]"
              alt={exercicio.nome}
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center text-slate-400 italic p-6 text-center">
              Mídia não Disponível
            </div>
          )}

          <button
            type="button"
            onClick={onFechar}
            className="absolute top-3 left-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">
                {fase.ordem}º Exercício da Sessão
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${infoDif.corBadge}`}>
                Dificuldade: {infoDif.label}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {exercicio.nome}
              </h2>
              <p className="text-sm text-blue-600 font-bold mt-1">
                Categoria: {exercicio.tipo_exercicio?.nome || 'Não informada'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Descrição do Exercício
              </span>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {exercicio.descricao || 'Nenhuma descrição informada.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Modo de Execução
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {fase.is_repeticao ? 'Por Repetições' : 'Por Tempo'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {fase.is_repeticao ? 'Quantidade' : 'Duração'}
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {fase.is_repeticao ? `${fase.repeticao} Repetições` : `${fase.tempo} Segundos`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onFechar}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
