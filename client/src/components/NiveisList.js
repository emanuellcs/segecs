import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function NiveisList({ refresh, onEditClick }) {
  const [niveis, setNiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNiveis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/niveis', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setNiveis(data);
      } catch (error) {
        console.error("Erro ao buscar níveis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNiveis();
  }, [refresh]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Nível?", "Deseja realmente remover este nível de acesso?");
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/niveis/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          setNiveis(niveis.filter(n => n.id_nivel !== id));
          Swal.fire('Deletado!', 'O nível foi removido.', 'success');
        } else {
          const errorData = await response.json();
          Swal.fire('Erro!', errorData.error || 'Não foi possível excluir o nível.', 'error');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o nível.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando níveis...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-16 text-center">ID</th>
            <th className="p-4 text-gray-600 font-semibold">Nível de Acesso</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {niveis.map((nivel) => (
            <tr key={nivel.id_nivel} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-gray-400 text-sm text-center">#{nivel.id_nivel}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaShieldAlt size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{nivel.nivel}</div>
                    <div className="text-xs text-gray-400 italic">
                      {nivel.descricao || 'Sem descrição cadastrada'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEditClick(nivel)} 
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Editar nível"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(nivel.id_nivel)} 
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir nível"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {niveis.length === 0 && (
            <tr>
              <td colSpan="3" className="p-10 text-center text-gray-400 italic">
                Nenhum nível encontrado no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NiveisList;