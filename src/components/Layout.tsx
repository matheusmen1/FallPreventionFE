import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AutoContext';

export function Layout() 
{
  const { usuarioLogado, logout } = useAuth();

  const cargoTexto = usuarioLogado?.nivel === 1 ? 'Fisioterapeuta' : 'Monitor';

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
    
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-10 shadow-lg">

        <div className="h-16 flex items-center px-6 text-xl font-bold border-b border-slate-800">
          🥽 Fall Prevention VR
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {
            usuarioLogado?.nivel === 1 && (
              <Link to="/usuarios" className="px-4 py-2 rounded hover:bg-slate-800 transition-colors">
                👥 Usuários
              </Link>
            )
          }
        
          <Link to="/pacientes" className="px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            🧓 Pacientes
          </Link>
        </nav>
      </aside>

     
      <div className="flex-1 flex flex-col overflow-hidden">
        
      
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6 z-0">
          
        
          <h2 className="text-lg font-semibold text-gray-700">Painel de Gerenciamento</h2>
          
          <div className="flex items-center gap-4">
            
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-gray-800 leading-none mb-1">
                {usuarioLogado?.nome}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {cargoTexto}
              </span>
            </div>

      
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-700 font-bold">
              {usuarioLogado?.nome?.charAt(0).toUpperCase()}
            </div>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            <button 
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}