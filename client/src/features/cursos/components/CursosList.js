import React from 'react';
import { FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import { confirmDelete } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function CursosList({ cursos, onEditClick, onDeleteSuccess }) {
  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Curso?", "Deseja realmente remover este curso?");
    if (result.isConfirmed) {
      try {
        await api.delete(`/cursos/${id}`);
        onDeleteSuccess();
        Swal.fire('Deletado!', 'Curso removido com sucesso.', 'success');
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o curso.', 'error');
      }
    }
  };

  if (cursos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        Nenhum curso cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="px-6 py-4">Curso</th>
            <th className="px-6 py-4">Eixo</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {cursos.map((curso) => (
            <tr key={curso.id_curso} className="group hover:bg-blue-50/30 transition-all">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <FaBook size={14} />
                  </div>
                  <span className="font-bold text-gray-700">{curso.nome_curso}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {curso.eixo_curso}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="p-2 h-10 w-10 !px-0" onClick={() => onEditClick(curso)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" className="p-2 h-10 w-10 !px-0" onClick={() => handleDelete(curso.id_curso)}>
                    <FaTrash />
                  </Button>
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
