import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSchool } from 'react-icons/fa';
import { confirmDelete } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';

function EscolasList({ refresh, onEditClick, setEscolas, escolas }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/escolas');
        setEscolas(response.data);
      } catch (error) {
        console.error('Erro ao buscar escolas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEscolas();
  }, [refresh, setEscolas]);

  const handleDelete = async (id) => {
    const result = await confirmDelete('Excluir Escola?', 'Deseja realmente remover esta escola?');
    if (result.isConfirmed) {
      try {
        await api.delete(`/escolas/${id}`);
        setEscolas(escolas.filter((e) => e.id_escola !== id));
        Swal.fire('Deletado!', 'Escola removida com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (loading && escolas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando escolas...</p>
      </div>
    );
  }

  if (escolas.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Nenhuma escola cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-4 py-4">Escola</th>
            <th className="px-4 py-4">INEP</th>
            <th className="px-4 py-4">Localização / Contato</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {escolas.map((escola) => (
            <tr key={escola.id_escola} className="group hover:bg-gray-50/50 transition-all">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <FaSchool size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block">{escola.nome_escola}</span>
                    <span className="text-xs text-gray-400 italic">
                      {escola.observacoes || 'Sem observações'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5 text-gray-500 font-medium text-sm">
                {escola.inep || <span className="text-gray-300">N/A</span>}
              </td>
              <td className="px-4 py-5">
                <div className="text-sm font-medium text-gray-700">
                  {escola.cidade} - {escola.uf}
                </div>
                {escola.telefone && <div className="text-xs text-gray-400">{escola.telefone}</div>}
                {escola.email && <div className="text-xs text-blue-500">{escola.email}</div>}
              </td>
              <td className="px-4 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditClick(escola)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(escola.id_escola)}
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

export default EscolasList;
