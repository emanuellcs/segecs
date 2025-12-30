import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaBookOpen } from 'react-icons/fa';

import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';



function CursosList({ refresh, onEditClick }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega os cursos sempre que 'refresh' for alterado no pai
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cursos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCursos(data);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [refresh]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Curso?", "Deseja realmente remover este curso do sistema?");
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cursos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          setCursos(cursos.filter(c => c.id_curso !== id));
          Swal.fire('Deletado!', 'O curso foi removido.', 'success');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o curso.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando cursos...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-16 text-center">ID</th>
            <th className="p-4 text-gray-600 font-semibold">Curso</th>
            <th className="p-4 text-gray-600 font-semibold">Eixo Tecnológico</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cursos.map((curso) => (
            <tr key={curso.id_curso} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-gray-400 text-sm text-center">#{curso.id_curso}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaBookOpen size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{curso.nome_curso}</div>
                    <div className="text-xs text-gray-400 italic truncate max-w-xs">
                      {curso.observacoes || 'Sem descrição cadastrada'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {curso.eixo_curso}
                </span>
              </td>
              <td className="p-4">
                {/* O container abaixo fica invisível até o mouse passar na TR */}
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEditClick(curso)} 
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Editar curso"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(curso.id_curso)} 
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir curso"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {cursos.length === 0 && (
            <tr>
              <td colSpan="4" className="p-10 text-center text-gray-400 italic">
                Nenhum curso encontrado no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CursosList;