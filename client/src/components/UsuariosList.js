import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

// 1. Recebemos 'usuarios' (dados) e 'setUsuarios' (função para atualizar o pai)
function UsuariosList({ refresh, onEditClick, setUsuarios, usuarios }) {
  // 2. Definimos o loading localmente, pois ele controla apenas a visualização desta tabela
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true); // Inicia loading
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Atualiza a lista no componente PAI (CadastroUsuarios)
        setUsuarios(data); 
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false); // Finaliza loading
      }
    };
    fetchUsuarios();
  }, [refresh, setUsuarios]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Usuário?", "Deseja realmente remover este usuário?");
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          // Atualiza o estado do PAI filtrando o item removido
          setUsuarios(usuarios.filter(u => u.id_usuario !== id));
          Swal.fire('Deletado!', 'Usuário removido.', 'success');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando usuários...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold">Usuário</th>
            <th className="p-4 text-gray-600 font-semibold">Email</th>
            <th className="p-4 text-gray-600 font-semibold">Nível</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* Agora 'usuarios' vem das props e não dará erro de undefined */}
          {usuarios.map((user) => (
            <tr key={user.id_usuario} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaUser size={14} />
                  </div>
                  <div className="font-bold text-gray-700">{user.nome_completo}</div>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-sm">{user.email}</td>
              <td className="p-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-xs">
                  {user.nome_nivel || user.id_nivel}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => onEditClick(user)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(user.id_usuario)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                    <FaTrash />
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