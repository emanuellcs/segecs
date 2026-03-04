import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function CursosForm({ onSuccess, cursoParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome_curso: '',
    eixo_curso: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cursoParaEditar) {
      setFormData(cursoParaEditar);
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
        Toast.fire({ icon: 'success', title: 'Curso atualizado!' });
      } else {
        await api.post('/cursos', formData);
        Toast.fire({ icon: 'success', title: 'Curso cadastrado!' });
      }
      onSuccess();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = err.response?.data?.message || 'Erro ao processar solicitação.';
      Swal.fire({
        icon: 'error',
        title: 'Erro de Validação',
        html: errors
          ? `<ul class="text-left text-sm">${errors.map((e) => `<li>• ${e.msg}</li>`).join('')}</ul>`
          : msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nome do Curso *
          </label>
          <input
            type="text"
            value={formData.nome_curso}
            onChange={(e) => setFormData({ ...formData, nome_curso: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Técnico em Informática"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Eixo Tecnológico *
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
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Observações
        </label>
        <textarea
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all min-h-[100px]"
          placeholder="Detalhes adicionais sobre o curso..."
        />
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-50">
        <Button onClick={onCancel} variant="secondary" icon={FaTimes}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} icon={FaSave}>
          {loading ? 'Salvando...' : 'Salvar Curso'}
        </Button>
      </div>
    </form>
  );
}

export default CursosForm;
