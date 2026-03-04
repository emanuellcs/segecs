import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { confirmDelete } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';

function CidadesList({ refresh, onEditClick, setCidades, cidades }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCidades = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cidades');
        setCidades(response.data);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCidades();
  }, [refresh, setCidades]);

  const handleDelete = async (id) => {
    const result = await confirmDelete('Excluir Cidade?', 'Deseja realmente remover esta cidade?');
    if (result.isConfirmed) {
      try {
        await api.delete(`/cidades/${id}`);
        setCidades(cidades.filter((c) => c.id_cidade !== id));
        Swal.fire('Deletado!', 'Cidade removida com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (loading && cidades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando cidades...</p>
      </div>
    );
  }

  if (cidades.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Nenhuma cidade cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-4 py-4">Cidade / UF</th>
            <th className="px-4 py-4">Observações</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {cidades.map((c) => (
            <tr key={c.id_cidade} className="group hover:bg-gray-50/50 transition-all">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {c.uf}
                  </div>
                  <span className="font-bold text-gray-700">{c.cidade}</span>
                </div>
              </td>
              <td className="px-4 py-5 text-gray-500 font-medium text-sm">
                {c.observacoes || <span className="text-gray-300 italic">Sem observações</span>}
              </td>
              <td className="px-4 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditClick(c)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id_cidade)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CidadesList;
