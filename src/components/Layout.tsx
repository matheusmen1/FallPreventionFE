import { useEffect, useState, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AutoContext';
import { useSessao } from '../contexts/SessaoContext';
interface LayoutProps {
  menuAberto: boolean;
}
export function Layout({ menuAberto }: LayoutProps) {
  const { usuarioLogado, logout } = useAuth();
  const { qtdPendentes, qtdRecusadas, qtdeAprovadas } = useSessao();
  
  const [dropdownAberto, setDropdownAberto] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cargoTexto = usuarioLogado?.nivel === 1 ? 'Fisioterapeuta' : 'Monitor';
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
  
  }, [menuAberto]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      <aside 
        className={`bg-slate-900 text-white z-10 shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
          menuAberto ? 'w-64' : 'w-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="h-16 flex items-center px-6 text-xl font-bold border-b border-slate-800 shrink-0">
          
            Fall Prevention VR
          </div>
          
          <nav className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto mt-2">
            <div>
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sessões
              </h3>
              <Link to="/atendimento" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium text-emerald-400">
                
                Sessões Disponíveis 
                {qtdeAprovadas > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                    {qtdeAprovadas}
                  </span>
                )}
              </Link>
              {usuarioLogado?.nivel === 1 && (
                <Link to="/aprovacao-sessoes" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors flex justify-between items-center">
                   
                   Sessões Pendentes
                  {qtdPendentes > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {qtdPendentes}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex flex-col gap-1">
                <Link to="/sessoes" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors flex justify-between items-center">
                  <span> Nova Sessão </span>
                  {qtdRecusadas > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      {qtdRecusadas}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div>
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gerenciar
              </h3>
              <div className="flex flex-col gap-1">
                <Link to="/pacientes" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                  
                  Pacientes
                </Link>
                {usuarioLogado?.nivel === 1 && (
                  <div className="flex flex-col gap-1">
                    <Link to="/usuarios" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Usuários
                    </Link>
                    <Link to="/exercicios" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Intervenções Clínicas
                    </Link>
                    <Link to="/tipo-intervencao-clinica" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Tipos de Intervenções
                    </Link>
                    <Link to="/doencas" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Doenças
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Relatórios
              </h3>
              <div className="flex flex-col gap-1">
                <Link to="/relatorio/observacao" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                  Observações
                </Link>
                <Link to="/relatorio/gravacoes" className="px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                  Gravações
                </Link>
              </div>
            </div>      
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6 z-0 transition-all duration-300">
          
          <div className="flex items-center gap-4">
          
            <h2 className="text-lg font-semibold text-gray-700">Painel de Gerenciamento</h2>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 leading-none mb-1">
                  {usuarioLogado?.nome}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {cargoTexto}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-700 font-bold uppercase">
                {usuarioLogado?.nome?.charAt(0)}
              </div>

              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50 animate-fade-in-up">
                <Link 
                    to="/meus-dados"
                    onClick={() => setDropdownAberto(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Meus Dados
                </Link>
                
                <hr className="border-gray-100 my-1" />
                
                <button 
                  onClick={() => {
                    setDropdownAberto(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}