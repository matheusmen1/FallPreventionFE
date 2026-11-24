import { useState, useEffect } from 'react';
import type { TipoExercicio } from '../types/tipoExercicio';
import { FeedbackCampo, classeBorda } from '../../../components/FeedbackCampo';

interface FormProps 
{
  onCancelar: () => void;
  onSalvar: (tipoExercicio: TipoExercicio) => void;
  tipoExercicioParaAlterar?: TipoExercicio | null;
}

export function FormTipoExercicio({ onCancelar, onSalvar, tipoExercicioParaAlterar }: FormProps) {
  const [formData, setFormData] = useState<TipoExercicio>({
    nome: ''
  });

  const [tentouEnviar, setTentouEnviar] = useState(false);
  const nomeOk = formData.nome.trim().length > 0;

  useEffect(() => {
    if (tipoExercicioParaAlterar) {
      setFormData(tipoExercicioParaAlterar);
    }
  }, [tipoExercicioParaAlterar]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {tipoExercicioParaAlterar ? 'Alterar Categoria' : 'Nova Categoria'}
      </h2>

      <form noValidate onSubmit={(e) => {
        e.preventDefault();
        setTentouEnviar(true);
        if (!nomeOk) 
          return;
        onSalvar(formData);
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none ${classeBorda(tentouEnviar, nomeOk)}`} />
            <FeedbackCampo exibir={tentouEnviar} valido={nomeOk} mensagemErro="Informe o Nome da Categoria." />
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