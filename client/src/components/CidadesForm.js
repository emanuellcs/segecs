import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

const LISTA_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function CidadesForm({ onSuccess, cidadeParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    cidade: '',
    uf: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cidadeParaEditar) {
      setFormData({
        cidade: cidadeParaEditar.cidade || '',
        uf: cidadeParaEditar.uf || '',
        observacoes: cidadeParaEditar.observacoes || ''
      });
    } else {
      setFormData({ cidade: '', uf: '', observacoes: '' });
    }
  }, [cidadeParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cidadeParaEditar) {
        await api.put(`/cidades/${cidadeParaEditar.id_cidade}`, formData);
        Toast.fire({ icon: 'success', title: 'Cidade atualizada com sucesso!' });
      } else {
        await api.post('/cidades', formData);
        Toast.fire({ icon: 'success', title: 'Cidade cadastrada com sucesso!' });
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao processar solicitação.';
      Swal.fire({ icon: 'error', title: 'Erro', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Cidade</label>
          <input 
            type="text" 
            value={formData.cidade}
            onChange={(e) => setFormData({...formData, cidade: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Crateús"
            required
          />
        </div>

        <div className="md:col-span-4 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">UF</label>
          <select
            value={formData.uf}
            onChange={(e) => setFormData({...formData, uf: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">--</option>
            {LISTA_UFS.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-12 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Observações</label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            rows="2"
            placeholder="Alguma observação relevante..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        {cidadeParaEditar ? (
          <>
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FaTimes /> Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </>
        ) : (
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Cidade'}
          </button>
        )}
      </div>
    </form>
  );
}

export default CidadesForm;
