import { useState, useEffect } from 'react';
import type { Paciente } from '../types/paciente';

interface FormProps 
{
  onCancelar: () => void;
  onSalvar: (usuario: Paciente) => void;
  pacienteParaAlterar?: Paciente | null;
}

export function FormPaciente({ onCancelar, onSalvar, pacienteParaAlterar }: FormProps) {
  const [formData, setFormData] = useState<Paciente>({
    nome: '', cpf: '', email: '', telefone: '', data_nascimento: ''
  });

  useEffect(() => {
    if (pacienteParaAlterar) {
      setFormData(pacienteParaAlterar);
    }
  }, [pacienteParaAlterar]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {pacienteParaAlterar ? 'Alterar Paciente' : 'Novo Paciente'}
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
            <label className="block text-sm font-medium text-gray-700">Data Nascimento</label>
            <input type="date" required value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

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