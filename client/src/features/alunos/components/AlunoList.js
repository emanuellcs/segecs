import React from 'react';
import { FaEdit, FaTrash, FaUserGraduate } from 'react-icons/fa';
import { confirmDelete } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function AlunoList({ alunos, onEditClick, onDeleteSuccess }) {
  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Aluno?", "Esta ação não pode ser desfeita.");
    if (result.isConfirmed) {
      try {
        await api.delete(`/alunos/${id}`);
        onDeleteSuccess();
        Swal.fire('Deletado!', 'O aluno foi removido com sucesso.', 'success');
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o aluno.', 'error');
      }
    }
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        Nenhum aluno cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="px-6 py-4">Aluno</th>
            <th className="px-6 py-4">Matrícula</th>
            <th className="px-6 py-4">Curso / Turma</th>
            <th className="px-6 py-4">Contato</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {alunos.map((aluno) => (
            <tr key={aluno.id_aluno} className="group hover:bg-blue-50/30 transition-all">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <FaUserGraduate size={16} />
                  </div>
                  <span className="font-bold text-gray-700">{aluno.nome}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-gray-500 font-medium text-sm">{aluno.matricula}</td>
              <td className="px-6 py-5">
                <p className="text-sm font-bold text-gray-700">{aluno.nome_curso}</p>
                <p className="text-xs text-gray-400">{aluno.turma || 'Sem turma'}</p>
              </td>
              <td className="px-6 py-5">
                <p className="text-sm text-gray-600">{aluno.email}</p>
                <p className="text-xs text-gray-400">{aluno.telefone}</p>
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="secondary" 
                    className="p-2 h-10 w-10 !px-0" 
                    onClick={() => onEditClick(aluno)}
                    title="Editar"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="danger" 
                    className="p-2 h-10 w-10 !px-0" 
                    onClick={() => handleDelete(aluno.id_aluno)}
                    title="Excluir"
                  >
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

export default AlunoList;
