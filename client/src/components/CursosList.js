import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaBookOpen } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

function CursosList({ refresh, onEditClick, setCursos, cursos }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cursos');
        setCursos(response.data); 
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, [refresh, setCursos]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Curso?", "Deseja realmente remover este curso?");
    if (result.isConfirmed) {
      try {
        await api.delete(`/cursos/${id}`);
        setCursos(cursos.filter(c => c.id_curso !== id));
        Swal.fire('Deletado!', 'Curso removido com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (loading && cursos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando cursos...</p>
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Nenhum curso cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-4 py-4">Curso</th>
            <th className="px-4 py-4">Eixo Tecnológico</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {cursos.map((curso) => (
            <tr key={curso.id_curso} className="group hover:bg-gray-50/50 transition-all">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <FaBookOpen size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block">{curso.nome_curso}</span>
                    <span className="text-xs text-gray-400 italic">
                      {curso.observacoes || 'Sem observações'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {curso.eixo_curso}
                </span>
              </td>
              <td className="px-4 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEditClick(curso)} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(curso.id_curso)} 
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

export default CursosList;
