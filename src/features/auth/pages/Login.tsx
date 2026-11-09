import { useState } from 'react';
import { useAuth } from '../../../contexts/AutoContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth(); 

  async function logar(e: React.FormEvent) {
    e.preventDefault();
    try {
      setErro('');
      setCarregando(true);
      await login(email, senha);
    } catch {
      setErro('E-mail ou Senha Incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 font-sans">
      
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-950 lg:bg-slate-900/60">
        <div className="w-full max-w-md">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-10 backdrop-blur-md">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Acesse sua conta
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">
                Digite suas Credenciais Para Entrar no Painel de Gerenciamento Clínico.
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-shake">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={logar} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Digite seu E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregando}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Senha <span className="text-red-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={carregando}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {carregando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
              <span>Acesso Restrito para Fisioterapeutas e Monitores</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
