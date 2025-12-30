import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function CidadesList({ refresh, onEditClick, setCidades, cidades }) {
  const [loading, setLoading] = useState(true);

  // Formata data para exibir bonitinho na tabela
  const formatData = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchCidades = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cidades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCidades(data); // Atualiza pai
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCidades();
  }, [refresh, setCidades]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Cidade?", "Essa ação não pode ser desfeita.");
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cidades/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setCidades(cidades.filter(c => c.id_cidade !== id));
          Swal.fire('Deletado!', 'Cidade removida.', 'success');
        } else {
          Swal.fire('Erro', 'Erro ao excluir (verifique se há vínculos).', 'error');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Falha de conexão.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando cidades...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-20">ID</th>
            <th className="p-4 text-gray-600 font-semibold">Cidade / UF</th>
            <th className="p-4 text-gray-600 font-semibold">Observações</th>
            <th className="p-4 text-gray-600 font-semibold text-xs uppercase">Última Atualização</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cidades.map((c) => (
            <tr key={c.id_cidade} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-gray-500 text-sm">#{c.id_cidade}</td>
              <td className="p-4 font-bold text-gray-700">
                {c.cidade} 
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded ml-2">
                  {c.uf}
                </span>
              </td>
              <td className="p-4 text-gray-600 text-sm italic">
                {c.observacoes || '-'}
              </td>
              <td className="p-4 text-gray-500 text-xs">
                {formatData(c.dt_atualizacao)}
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => onEditClick(c)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg" title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(c.id_cidade)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Excluir">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {cidades.length === 0 && (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-400">
                Nenhuma cidade cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CidadesList;