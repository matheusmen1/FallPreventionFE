import { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AutoContext';
import { useSessao } from '../contexts/SessaoContext';
import { 
  Calendar, 
  ChevronDown, 
  ClipboardList, 
  PlusCircle, 
  Users, 
  Stethoscope, 
  HeartPulse, 
  Layers, 
  Activity, 
  FileText, 
  Video, 
  User, 
  LogOut,
  CalendarCheck,
  UserCheck,
  CheckCircle,
  ChevronLeft
} from 'lucide-react';

interface LayoutProps {
  menuAberto: boolean;
}

function VrHeadsetIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-3.2a1.5 1.5 0 0 0-1.4 1v0a1 1 0 0 1-1.8 0v0a1.5 1.5 0 0 0-1.4-1H6a3 3 0 0 1-3-3V8z" />
   
      <circle cx="7.5" cy="11.5" r="2" />
      <circle cx="16.5" cy="11.5" r="2" />
      <path d="M3 11H1.5" />
      <path d="M22.5 11H21" />
    </svg>
  );
}

function getInfoPagina(pathname: string): { titulo: string; categoria: string } {
  if (pathname.startsWith('/pacientes')) {
    return { titulo: 'Gerenciar Pacientes', categoria: 'Gerenciamento' };
  }
  if (pathname.startsWith('/usuarios')) {
    return { titulo: 'Gerenciar Usuários', categoria: 'Gerenciamento' };
  }
  if (pathname.startsWith('/exercicios')) {
    return { titulo: 'Gerenciar Exercícios', categoria: 'Gerenciamento' };
  }
  if (pathname.startsWith('/categoria')) {
    return { titulo: 'Gerenciar Categorias', categoria: 'Gerenciamento' };
  }
  if (pathname.startsWith('/doencas')) {
    return { titulo: 'Gerenciar Doenças', categoria: 'Gerenciamento' };
  }
  if (pathname.startsWith('/atendimento-monitores')) {
    return { titulo: 'Sessões dos Monitores', categoria: 'Sessões' };
  }
  if (pathname.startsWith('/atendimento-autorizadas')) {
    return { titulo: 'Sessões Autorizadas', categoria: 'Sessões' };
  }
  if (pathname.startsWith('/atendimento')) {
    return { titulo: 'Minhas Sessões', categoria: 'Sessões' };
  }
  if (pathname.startsWith('/aprovacao-sessoes')) {
    return { titulo: 'Aprovação de Sessões Pendentes', categoria: 'Sessões' };
  }
  if (pathname.startsWith('/sessoes')) {
    return { titulo: 'Gerenciar Sessões', categoria: 'Sessões' };
  }
  if (pathname.startsWith('/relatorio/execucao') || pathname.startsWith('/relatorio/sessao') || pathname.startsWith('/relatorios/sessao')) {
    return { titulo: 'Relatório de Resultados da Sessão', categoria: 'Relatórios' };
  }
  if (pathname.startsWith('/relatorio/observacao')) {
    return { titulo: 'Relatório de Observações da Sessão', categoria: 'Relatórios' };
  }
  if (pathname.startsWith('/relatorio/gravacoes')) {
    return { titulo: 'Relatório de Gravações da Sessão', categoria: 'Relatórios' };
  }
  if (pathname.startsWith('/meus-dados')) {
    return { titulo: 'Meus Dados', categoria: 'Perfil' };
  }
  if (pathname.startsWith('/sessao/execucao')) {
    return { titulo: 'Execução de Sessão', categoria: 'Sessões' };
  }
  return { titulo: 'Painel Clínico', categoria: 'Início' };
}

export function Layout({ menuAberto }: LayoutProps) {
  const { usuarioLogado, logout } = useAuth();
  const { qtdPendentes, qtdRecusadas, qtdeAprovadas, qtdeAprovadasMonitores, qtdeAprovadasAutorizadas } = useSessao();
  const location = useLocation();

  const [recolhido, setRecolhido] = useState(() => {
    return localStorage.getItem('fp_menu_recolhido') === 'true';
  });

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [sessoesDropdownAberto, setSessoesDropdownAberto] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cargoTexto = usuarioLogado?.nivel === 1 ? 'Fisioterapeuta' : usuarioLogado?.nivel === 0 ? 'Monitor' : 'Administrador';
  
  const totalAtendimentos = (qtdeAprovadas || 0) + (qtdeAprovadasMonitores || 0);
  const totalAtendimentosMonitor = (qtdeAprovadasAutorizadas || 0) + (qtdeAprovadas || 0);

  const infoPagina = getInfoPagina(location.pathname);

  const toggleRecolhido = () => {
    setRecolhido((prev) => {
      const proximo = !prev;
      localStorage.setItem('fp_menu_recolhido', String(proximo));
      return proximo;
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const larguraAside = !menuAberto ? 'w-0' : recolhido ? 'w-20' : 'w-72';

  const isRotaAtiva = (caminho: string) => {
    return location.pathname === caminho || location.pathname.startsWith(caminho + '/');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside
        className={`bg-slate-900 text-white z-20 shadow-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col shrink-0 ${larguraAside}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800 shrink-0 bg-slate-950/50">
            {!recolhido ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/20 shrink-0">
                  <VrHeadsetIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <span className="font-extrabold text-[15px] tracking-tight text-slate-100">
                    Fall Prevention
                  </span>
                  <span className="ml-1.5 px-2 py-0.5 text-[11px] font-black tracking-widest text-cyan-300 bg-cyan-950/90 border border-cyan-400/50 rounded-md shadow-sm shadow-cyan-500/25 shrink-0">
                    VR
                  </span>
                </div>
              </div>
            ) : (
              <div 
                className="w-full flex justify-center cursor-pointer" 
                onClick={toggleRecolhido}
                title="Expandir menu (Fall Prevention VR)"
              >
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:scale-105 transition-all">
                  <VrHeadsetIcon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            )}

            {!recolhido && (
              <button
                type="button"
                onClick={toggleRecolhido}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Recolher menu"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          <nav className="flex-1 p-3 flex flex-col gap-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
            
            <div>
              {!recolhido ? (
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                  <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-400" />
                    Sessões
                  </span> 
                </div>
              ) : (
                <div className="flex justify-center my-1" title="Sessões">
                  <span className="w-8 h-1 rounded-full bg-emerald-500/50"></span>
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (recolhido) {
                      setRecolhido(false);
                      setSessoesDropdownAberto(true);
                    } else {
                      setSessoesDropdownAberto(!sessoesDropdownAberto);
                    }
                  }}
                  aria-expanded={sessoesDropdownAberto}
                  className={`w-full py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center font-medium text-emerald-400 ${
                    recolhido ? 'justify-center px-0' : 'justify-between px-3'
                  }`}
                  title="Sessões Disponíveis"
                >
                  <span className="flex items-center gap-2.5">
                    <div className="relative">
                      <Calendar size={18} />
                      {recolhido && ((usuarioLogado?.nivel! >= 1  ? totalAtendimentos : totalAtendimentosMonitor) > 0) && (
                        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
                      )}
                    </div>
                    {!recolhido && (
                      <>
                        <span className="text-sm">Sessões Disponíveis</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                          {usuarioLogado?.nivel! >= 1 ? totalAtendimentos : totalAtendimentosMonitor}
                        </span>
                      </>
                    )}
                  </span>
                  {!recolhido && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 text-emerald-400 ${sessoesDropdownAberto ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                {sessoesDropdownAberto && !recolhido && (
                  <div className="ml-4 mt-1.5 space-y-1 border-l-2 border-emerald-900/80 pl-2.5">
                    <Link
                      to="/atendimento"
                      className={`flex justify-between items-center px-3 py-1.5 rounded-md transition-colors text-sm ${
                        isRotaAtiva('/atendimento') 
                          ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-700/40' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      onClick={() => setSessoesDropdownAberto(false)}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <CalendarCheck size={15} />
                        Minhas Sessões
                      </span>
                      {qtdeAprovadas > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {qtdeAprovadas}
                        </span>
                      )}
                    </Link>
                    
                    {usuarioLogado?.nivel! >= 1 && (
                      <Link
                        to="/atendimento-monitores"
                        className={`flex justify-between items-center px-3 py-1.5 rounded-md transition-colors text-sm ${
                          isRotaAtiva('/atendimento-monitores')
                            ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-700/40'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        onClick={() => setSessoesDropdownAberto(false)}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <UserCheck size={15} />
                          Meus Monitores
                        </span>
                        {qtdeAprovadasMonitores > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {qtdeAprovadasMonitores}
                          </span>
                        )}
                      </Link>
                    )}
                    
                    {usuarioLogado?.nivel === 0 && (
                      <Link
                        to="/atendimento-autorizadas"
                        className={`flex justify-between items-center px-3 py-1.5 rounded-md transition-colors text-sm ${
                          isRotaAtiva('/atendimento-autorizadas')
                            ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-700/40'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        onClick={() => setSessoesDropdownAberto(false)}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <CheckCircle size={15} />
                          Autorizadas
                        </span>
                        {qtdeAprovadasAutorizadas > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {qtdeAprovadasAutorizadas}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {usuarioLogado?.nivel! >= 1 && (
                <Link 
                  to="/aprovacao-sessoes" 
                  className={`mt-1 py-2 rounded-lg transition-colors flex items-center ${
                    isRotaAtiva('/aprovacao-sessoes')
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'justify-between px-3'}`}
                  title="Sessões Pendentes"
                >
                  <span className="flex items-center gap-2.5">
                    <div className="relative">
                      <ClipboardList size={18} className="text-slate-400" />
                      {recolhido && qtdPendentes > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
                      )}
                    </div>
                    {!recolhido && <span className="text-sm">Sessões Pendentes</span>}
                  </span>
                  {!recolhido && qtdPendentes > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {qtdPendentes}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Nova Sessão */}
              <Link 
                to="/sessoes" 
                className={`mt-1 py-2 rounded-lg transition-colors flex items-center ${
                  isRotaAtiva('/sessoes')
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                } ${recolhido ? 'justify-center px-0' : 'justify-between px-3'}`}
                title="Gerenciar / Nova Sessão"
              >
                <span className="flex items-center gap-2.5">
                  <div className="relative">
                    <PlusCircle size={18} className="text-slate-400" />
                    {recolhido && qtdRecusadas > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
                    )}
                  </div>
                  {!recolhido && <span className="text-sm">Nova Sessão</span>}
                </span>
                {!recolhido && qtdRecusadas > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {qtdRecusadas}
                  </span>
                )}
              </Link>
            </div>

            {/* SEÇÃO 2: GERENCIAMENTO (DESTACADA) */}
            <div>
              {!recolhido ? (
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-400">
                  <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={13} className="text-blue-400" />
                    Gerenciamento
                  </span>
                </div>
              ) : (
                <div className="flex justify-center my-1" title="Gerenciamento">
                  <span className="w-8 h-1 rounded-full bg-blue-500/50"></span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Link 
                  to="/pacientes" 
                  className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    isRotaAtiva('/pacientes')
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                  title="Gerenciar Pacientes"
                >
                  <Stethoscope size={18} className={isRotaAtiva('/pacientes') ? 'text-white' : 'text-slate-400'} />
                  {!recolhido && <span className="text-sm">Pacientes</span>}
                </Link>

                {usuarioLogado?.nivel === 2 && (
                  <>
                    <Link 
                      to="/usuarios" 
                      className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                        isRotaAtiva('/usuarios')
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                      title="Gerenciar Usuários"
                    >
                      <Users size={18} className={isRotaAtiva('/usuarios') ? 'text-white' : 'text-slate-400'} />
                      {!recolhido && <span className="text-sm">Usuários</span>}
                    </Link>

                    <Link 
                      to="/exercicios" 
                      className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                        isRotaAtiva('/exercicios')
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                      title="Gerenciar Exercícios"
                    >
                      <HeartPulse size={18} className={isRotaAtiva('/exercicios') ? 'text-white' : 'text-slate-400'} />
                      {!recolhido && <span className="text-sm">Exercícios</span>}
                    </Link>

                    <Link 
                      to="/categorias" 
                      className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                        isRotaAtiva('/categorias')
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                      title="Categorias"
                    >
                      <Layers size={18} className={isRotaAtiva('/categorias') ? 'text-white' : 'text-slate-400'} />
                      {!recolhido && <span className="text-sm">Categorias</span>}
                    </Link>
                  </>
                )}

                <Link 
                  to="/doencas" 
                  className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    isRotaAtiva('/doencas')
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                  title="Gerenciar Doenças"
                >
                  <Activity size={18} className={isRotaAtiva('/doencas') ? 'text-white' : 'text-slate-400'} />
                  {!recolhido && <span className="text-sm">Doenças</span>}
                </Link>
              </div>
            </div>

            <div>
              {!recolhido ? (
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-400">
                  <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-400" />
                    Relatórios
                  </span>
                </div>
              ) : (
                <div className="flex justify-center my-1" title="Relatórios">
                  <span className="w-8 h-1 rounded-full bg-purple-500/50"></span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Link 
                  to="/relatorio/execucao" 
                  className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    isRotaAtiva('/relatorio/execucao') || isRotaAtiva('/relatorio/sessao')
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                  title="Relatório de Execução VR"
                >
                  <ClipboardList size={18} className={isRotaAtiva('/relatorio/execucao') ? 'text-white' : 'text-slate-400'} />
                  {!recolhido && <span className="text-sm">Resultados</span>}
                </Link>

                <Link 
                  to="/relatorio/observacao" 
                  className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    isRotaAtiva('/relatorio/observacao')
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                  title="Relatório de Observações"
                >
                  <FileText size={18} className={isRotaAtiva('/relatorio/observacao') ? 'text-white' : 'text-slate-400'} />
                  {!recolhido && <span className="text-sm">Observações</span>}
                </Link>

                <Link 
                  to="/relatorio/gravacoes" 
                  className={`py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    isRotaAtiva('/relatorio/gravacoes')
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  } ${recolhido ? 'justify-center px-0' : 'px-3'}`}
                  title="Relatório de Gravações"
                >
                  <Video size={18} className={isRotaAtiva('/relatorio/gravacoes') ? 'text-white' : 'text-slate-400'} />
                  {!recolhido && <span className="text-sm">Gravações</span>}
                </Link>
              </div>
            </div>
          </nav>

        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6 z-10 transition-all duration-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {infoPagina.categoria}
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {infoPagina.titulo}
                </h2>
              </div>
            </div>
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

              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-700 font-bold uppercase shadow-sm">
                {usuarioLogado?.nome?.charAt(0)}
              </div>

              <ChevronDown 
                size={16} 
                className={`text-gray-500 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} 
              />
            </button>

            {dropdownAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-gray-200 z-50">
                <Link
                  to="/meus-dados"
                  onClick={() => setDropdownAberto(false)}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                >
                  <User size={16} className="text-slate-500" />
                  Meus Dados
                </Link>

                <hr className="border-gray-100 my-1" />

                <button
                  onClick={() => {
                    setDropdownAberto(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-2"
                >
                  <LogOut size={16} className="text-red-500" />
                  Sair do Sistema
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
