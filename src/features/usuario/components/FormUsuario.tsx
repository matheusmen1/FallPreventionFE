import { useState, useEffect } from 'react';
import type { Usuario } from '../types/usuario';

interface FormProps 
{
  onCancelar: () => void;
  onSalvar: (usuario: Usuario) => void;
  usuarioParaAlterar?: Usuario | null;
  listaFisioterapeutas: Usuario[];
}

export function FormUsuario({ onCancelar, onSalvar, usuarioParaAlterar, listaFisioterapeutas }: FormProps) {
  const [formData, setFormData] = useState<Usuario>({
    nome: '', cpf: '', email: '', telefone: '', ra: '', nivel: 0, senha: '', responsavel: undefined
  });

  useEffect(() => {
    if (usuarioParaAlterar) {
      setFormData(usuarioParaAlterar);
    }
  }, [usuarioParaAlterar]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {usuarioParaAlterar ? 'Alterar Usuário' : 'Novo Usuário'}
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); onSalvar(formData); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input type="text" required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input type="text" required value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RA</label>
            <input type="text" required value={formData.ra} onChange={e => setFormData({...formData, ra: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cargo</label>
            <select value={formData.nivel} onChange={e => setFormData({...formData, nivel: Number(e.target.value)})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none bg-blue-50">
              <option value={0}>Monitor</option>
              <option value={1}>Fisioterapeuta</option>
            </select>
          </div>
           <div>
          <label className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input type="password" required={!usuarioParaAlterar} value={formData.senha || ''} onChange={e => setFormData({...formData, senha: e.target.value})}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none " />
        </div>
          {formData.nivel === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fisioterapeuta Responsável</label>
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
          <button type="button" onClick={onCancelar}
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