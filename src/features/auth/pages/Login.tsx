import { useState } from 'react';
import { useAuth } from '../../../contexts/AutoContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth(); 

  async function logar(e: React.FormEvent) {
    e.preventDefault();
    try {
      setErro('');
      await login(email, senha);
    } catch (err) {
      setErro('E-mail ou Senha Incorreto(s).');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2"></h1>
          <h2 className="text-2xl font-bold text-gray-800">Fall Prevention VR</h2>
          <p className="text-gray-500 text-sm">Faça login para acessar o painel</p>
        </div>

        <form onSubmit={logar} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          {erro && <p className="text-red-500 text-sm text-center font-medium">{erro}</p>}

          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}