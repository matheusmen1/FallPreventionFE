import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SecaoAjudaProps {
  id: string;
  numero: number;
  titulo: string;
  resumo: string;
  aberta: boolean;
  onAlternar: () => void;
  children: ReactNode;
}

export function SecaoAjuda({ id, numero, titulo, resumo, aberta, onAlternar, children }: SecaoAjudaProps) {
  return (
    <section id={id} className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberta}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
          {numero}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-bold text-gray-800">{titulo}</span>
          <span className="block text-sm text-gray-500">{resumo}</span>
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-400 shrink-0 transition-transform ${aberta ? "rotate-180" : ""}`}
        />
      </button>

      {aberta && (
        <div className="px-5 pb-6 pt-1 border-t border-gray-100 space-y-4 text-sm text-gray-700 leading-relaxed">
          {children}
        </div>
      )}
    </section>
  );
}


export function Passos({ itens }: { itens: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-6 h-6 shrink-0 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Dica({ children, tipo = "info" }: { children: ReactNode; tipo?: "info" | "atencao" }) {
  const estilo =
    tipo === "atencao"
      ? "bg-amber-50 border-amber-400 text-amber-900"
      : "bg-blue-50 border-blue-400 text-blue-900";
  return (
    <div className={`border-l-4 rounded-r-md px-4 py-3 text-sm ${estilo}`}>{children}</div>
  );
}

export function SubTitulo({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">{children}</h3>
  );
}

export function Tabela({ colunas, linhas }: { colunas: string[]; linhas: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {colunas.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {linhas.map((linha, i) => (
            <tr key={i} className="align-top">
              {linha.map((celula, j) => (
                <td key={j} className="px-3 py-2">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Rotulo({ children }: { children: ReactNode }) {
  return (
    <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 whitespace-nowrap">
      {children}
    </span>
  );
}
