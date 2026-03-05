import React from 'react';
import { FaEdit, FaTrash, FaCircle } from 'react-icons/fa';
import { confirmDelete } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function UsuariosList({ usuarios, onEditClick, onDeleteSuccess }) {
  const handleDelete = async (id) => {
    const result = await confirmDelete(
      'Excluir Usuário?',
      'Deseja realmente remover este usuário?'
    );
    if (result.isConfirmed) {
      try {
        await api.delete(`/usuarios/${id}`);
        onDeleteSuccess();
        Swal.fire('Deletado!', 'Usuário removido com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        Nenhum usuário cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="px-6 py-4">Usuário</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Perfil</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {usuarios.map((user) => (
            <tr key={user.id_usuario} className="group hover:bg-blue-50/30 transition-all">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user.nome_completo.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-700">{user.nome_completo}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-gray-500 font-medium text-sm">{user.email}</td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {user.nome_nivel}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <FaCircle className={user.ativo ? 'text-green-500' : 'text-gray-300'} size={8} />
                  <span
                    className={`text-xs font-bold uppercase ${user.ativo ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    className="p-2 h-10 w-10 !px-0"
                    onClick={() => onEditClick(user)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    className="p-2 h-10 w-10 !px-0"
                    onClick={() => handleDelete(user.id_usuario)}
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

export default UsuariosList;
