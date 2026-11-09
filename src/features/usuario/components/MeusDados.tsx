import { useState, useEffect } from 'react';
import type { Usuario } from '../types/usuario';
import { useAuth } from '../../../contexts/AutoContext';
import { usuarioService } from '../../../services/usuarioService';
import { Eye, EyeOff } from 'lucide-react';

export function MeusDados() { 
  const [formData, setFormData] = useState<Usuario>({
    nome: '', cpf: '', email: '', telefone: '', ra: '', nivel: 0, senha: '', responsavel: undefined
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { usuarioLogado, atualizarUsuarioLogado } = useAuth();
  const [listaFisioterapeutas, setListaFisioterapeutas] = useState<Usuario[]>([]);

  useEffect(() => {
    carregarFisioterapeutas();
    carregarMeusDados();
  }, []);

  async function carregarFisioterapeutas() 
  {
    try {
      const fisioterapeutas = await usuarioService.getAllFisioterapeutas();
      setListaFisioterapeutas(fisioterapeutas);
    } catch (error) {
      console.error('Erro ao Carregar Fisioterapeutas:', error);
    }
  }

  async function carregarMeusDados() {
    if (usuarioLogado) {
      setFormData(usuarioLogado);
    } 
  }

  async function onAtualizarDados(usuario: Usuario)
  {
    try {
      await usuarioService.put(usuario);
      atualizarUsuarioLogado(usuario);
      window.history.back();
    } catch (error) {
      alert('Erro ao atualizar.');
      console.error('Erro ao Atualizar Dados:', error);
    }
  }

  const mascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') 
      .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  const mascaraTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, ''); 
    if (v.length <= 10) {
      return v
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return v
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Meus Dados
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); onAtualizarDados(formData); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CPF <span className="text-red-500">*</span></label>
            <input disabled type="text" required minLength={14} value={formData.cpf} onChange={e => setFormData({...formData, cpf: mascaraCPF(e.target.value)})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
            <input type="text" required minLength={14} maxLength={15} value={formData.telefone} onChange={e => setFormData({...formData, telefone: mascaraTelefone(e.target.value)})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RA/Matrícula <span className="text-red-500">*</span></label>
            <input disabled type="text" required value={formData.ra} onChange={e => setFormData({...formData, ra: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cargo <span className="text-red-500">*</span></label>
            <input disabled type="text" required value={formData.nivel === 2 ? 'Administrador' : formData.nivel === 1 ? 'Fisioterapeuta' : 'Monitor'}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none bg-blue-50" />
           
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                required 
                value={formData.senha || ''} 
                onChange={e => setFormData({...formData, senha: e.target.value})}
                className="block w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 shadow-sm focus:border-blue-500 focus:outline-none" 
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {formData.nivel === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fisioterapeuta Responsável <span className="text-red-500">*</span></label>
              <select 
                required 
                value={formData.responsavel?.id || ''} 
                onChange={e => {
                  const idSelecionado = Number(e.target.value);
                  const fisioCompleto = listaFisioterapeutas.find(fisio => fisio.id === idSelecionado);
                  setFormData({ 
                    ...formData, 
                    responsavel: fisioCompleto || undefined 
                  });
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none bg-blue-50"
              >
                <option value="">Selecione um Fisioterapeuta...</option>
                {listaFisioterapeutas.map(fisio => (
                  <option key={fisio.id} value={fisio.id}>
                    {fisio.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
         
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={() => window.history.back()}
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
