import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';

function NiveisForm({ onSuccess, nivelParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nivel: '',
    descricao: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nivelParaEditar) {
      setFormData({
        nivel: nivelParaEditar.nivel || '',
        descricao: nivelParaEditar.descricao || '',
      });
    } else {
      setFormData({ nivel: '', descricao: '' });
    }
  }, [nivelParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (nivelParaEditar) {
        await api.put(`/niveis/${nivelParaEditar.id_nivel}`, formData);
        Toast.fire({ icon: 'success', title: 'Nível atualizado com sucesso!' });
      } else {
        await api.post('/niveis', formData);
        Toast.fire({ icon: 'success', title: 'Nível cadastrado com sucesso!' });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nome do Nível
          </label>
          <input
            type="text"
            value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Administrador"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Descrição
          </label>
          <input
            type="text"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="O que este nível pode fazer?"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        {nivelParaEditar ? (
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
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Nível'}
          </button>
        )}
      </div>
    </form>
  );
}

export default NiveisForm;
