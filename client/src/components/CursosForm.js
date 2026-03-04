import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

function CursosForm({ onSuccess, cursoParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome_curso: '',
    eixo_curso: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cursoParaEditar) {
      setFormData({
        nome_curso: cursoParaEditar.nome_curso || '',
        eixo_curso: cursoParaEditar.eixo_curso || '',
        observacoes: cursoParaEditar.observacoes || '',
      });
    } else {
      setFormData({ nome_curso: '', eixo_curso: '', observacoes: '' });
    }
  }, [cursoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cursoParaEditar) {
        await api.put(`/cursos/${cursoParaEditar.id_curso}`, formData);
        Toast.fire({ icon: 'success', title: 'Curso atualizado com sucesso!' });
      } else {
        await api.post('/cursos', formData);
        Toast.fire({ icon: 'success', title: 'Curso cadastrado com sucesso!' });
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
            Nome do Curso
          </label>
          <input
            type="text"
            value={formData.nome_curso}
            onChange={(e) => setFormData({ ...formData, nome_curso: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Informática"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Eixo Tecnológico
          </label>
          <input
            type="text"
            value={formData.eixo_curso}
            onChange={(e) => setFormData({ ...formData, eixo_curso: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Informação e Comunicação"
            required
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            rows="2"
            placeholder="Notas adicionais sobre o curso..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        {cursoParaEditar ? (
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
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Curso'}
          </button>
        )}
      </div>
    </form>
  );
}

export default CursosForm;
