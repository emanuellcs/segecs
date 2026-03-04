import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUser, FaCircle } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

function UsuariosList({ refresh, onEditClick, setUsuarios, usuarios }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await api.get('/usuarios');
        setUsuarios(response.data); 
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [refresh, setUsuarios]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Usuário?", "Deseja realmente remover este usuário?");
    if (result.isConfirmed) {
      try {
        await api.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter(u => u.id_usuario !== id));
        Swal.fire('Deletado!', 'Usuário removido com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando usuários...</p>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Nenhum usuário cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-4 py-4">Usuário</th>
            <th className="px-4 py-4">Email</th>
            <th className="px-4 py-4">Perfil</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {usuarios.map((user) => (
            <tr key={user.id_usuario} className="group hover:bg-gray-50/50 transition-all">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user.nome_completo.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-700">{user.nome_completo}</span>
                </div>
              </td>
              <td className="px-4 py-5 text-gray-500 font-medium text-sm">{user.email}</td>
              <td className="px-4 py-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {user.nome_nivel}
                </span>
              </td>
              <td className="px-4 py-5">
                <div className="flex items-center gap-2">
                  <FaCircle className={user.ativo ? "text-green-500" : "text-gray-300"} size={8} />
                  <span className={`text-xs font-bold uppercase ${user.ativo ? "text-green-600" : "text-gray-400"}`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEditClick(user)} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id_usuario)} 
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

export default UsuariosList;
