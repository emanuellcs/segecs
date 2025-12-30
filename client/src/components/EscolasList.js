import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSchool } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function EscolasList({ refresh, onEditClick }) {
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/escolas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setEscolas(data);
      } catch (error) {
        console.error("Erro ao buscar escolas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEscolas();
  }, [refresh]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Escola?", "Deseja realmente remover esta escola do sistema?");
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/escolas/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          setEscolas(escolas.filter(e => e.id_escola !== id));
          Swal.fire('Deletado!', 'A escola foi removida.', 'success');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir a escola.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando escolas...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-16 text-center">ID</th>
            <th className="p-4 text-gray-600 font-semibold">Escola</th>
            <th className="p-4 text-gray-600 font-semibold">Código INEP</th>
            <th className="p-4 text-gray-600 font-semibold">Cidade / Contato</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {escolas.map((escola) => (
            <tr key={escola.id_escola} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-gray-400 text-sm text-center">#{escola.id_escola}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaSchool size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{escola.nome_escola}</div>
                    <div className="text-xs text-gray-400 italic truncate max-w-xs">
                      {escola.observacoes || 'Sem descrição cadastrada'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {escola.inep || '—'}
                </span>
              </td>
              <td className="p-4 text-gray-600 text-sm">
                <div className="font-medium">{escola.cidade ? `${escola.cidade} - ${escola.uf}` : '—'}</div>
                {escola.endereco_escola && <div className="text-xs text-gray-400">{escola.endereco_escola}</div>}
                {escola.telefone && <div className="text-xs text-gray-500">📞 {escola.telefone}</div>}
                {escola.email && <div className="text-xs text-blue-600">✉ {escola.email}</div>}
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEditClick(escola)} 
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Editar escola"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(escola.id_escola)} 
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir escola"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {escolas.length === 0 && (
            <tr>
              <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                Nenhuma escola encontrada no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EscolasList;