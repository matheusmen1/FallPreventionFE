export function classeBorda(exibir: boolean, valido: boolean, escuro = false): string {
  if (!exibir) {
    return escuro
      ? 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
      : 'border-gray-300 focus:border-blue-500';
  }
  if (valido) {
    return escuro
      ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
      : 'border-green-500 focus:border-green-500';
  }
  return escuro
    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-red-500 focus:border-red-500';
}

interface FeedbackCampoProps {
  exibir: boolean;
  valido: boolean;
  mensagemErro: string;
  mensagemOk?: string;
  escuro?: boolean;
}

export function FeedbackCampo({ exibir, valido, mensagemErro, mensagemOk = '', escuro = false }: FeedbackCampoProps) {
  if (!exibir) 
    return null;
  return valido
    ? <p className={`mt-1 text-xs font-medium ${escuro ? 'text-green-400' : 'text-green-600'}`}>{mensagemOk}</p>
    : <p className={`mt-1 text-xs font-medium ${escuro ? 'text-red-400' : 'text-red-600'}`}>{mensagemErro}</p>;
}
