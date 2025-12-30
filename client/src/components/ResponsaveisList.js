import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function ResponsaveisList({ refresh, onEditClick }) {
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/responsaveis', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setResponsaveis(data);
      } catch (error) {
        console.error("Erro ao buscar responsáveis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsaveis();
  }, [refresh]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Responsável?", "Deseja realmente remover este responsável do sistema?");
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/responsaveis/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          setResponsaveis(responsaveis.filter(r => r.id_responsavel !== id));
          Swal.fire('Deletado!', 'O responsável foi removido.', 'success');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o responsável.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando responsáveis...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-16 text-center">ID</th>
            <th className="p-4 text-gray-600 font-semibold">Responsável</th>
            <th className="p-4 text-gray-600 font-semibold">Documentos</th>
            <th className="p-4 text-gray-600 font-semibold">Localização / Contato</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {responsaveis.map((responsavel) => (
            <tr key={responsavel.id_responsavel} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-gray-400 text-sm text-center">#{responsavel.id_responsavel}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaUserTie size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{responsavel.nome}</div>
                    <div className="text-xs text-gray-400 italic truncate max-w-xs">
                      {responsavel.observacoes || 'Sem observações cadastradas'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-sm">
                {responsavel.cpf && (
                  <div className="mb-1">
                    <span className="text-xs text-gray-500">CPF:</span>{' '}
                    <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {responsavel.cpf}
                    </span>
                  </div>
                )}
                {responsavel.rg && (
                  <div>
                    <span className="text-xs text-gray-500">RG:</span>{' '}
                    <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {responsavel.rg}
                    </span>
                  </div>
                )}
                {!responsavel.cpf && !responsavel.rg && <span className="text-gray-400">—</span>}
              </td>
              <td className="p-4 text-gray-600 text-sm">
                {responsavel.cidade && (
                  <div className="font-medium">{responsavel.cidade} - {responsavel.uf}</div>
                )}
                {responsavel.bairro && (
                  <div className="text-xs text-gray-400">{responsavel.bairro}</div>
                )}
                {responsavel.telefone && (
                  <div className="text-xs text-gray-500">📞 {responsavel.telefone}</div>
                )}
                {!responsavel.cidade && !responsavel.bairro && !responsavel.telefone && (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEditClick(responsavel)} 
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Editar responsável"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(responsavel.id_responsavel)} 
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir responsável"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {responsaveis.length === 0 && (
            <tr>
              <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                Nenhum responsável encontrado no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ResponsaveisList;