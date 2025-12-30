import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserGraduate } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function AlunoList({ refresh, onEditClick }) {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/alunos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setAlunos(data);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [refresh]);

  const handleDelete = async (id) => {
    const result = await confirmDelete("Excluir Aluno?", "Deseja realmente remover este aluno do sistema?");
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/alunos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          setAlunos(alunos.filter(a => a.id_aluno !== id));
          Swal.fire('Deletado!', 'O aluno foi removido.', 'success');
        }
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o aluno.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Carregando alunos...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-600 font-semibold w-24 text-center">Matrícula</th>
            <th className="p-4 text-gray-600 font-semibold">Aluno</th>
            <th className="p-4 text-gray-600 font-semibold">Curso</th>
            <th className="p-4 text-gray-600 font-semibold text-center">Turma</th>
            <th className="p-4 text-gray-600 font-semibold text-center w-32">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {alunos.map((aluno) => (
            <tr key={aluno.id_aluno} className="hover:bg-blue-50/40 transition-colors group">
              <td className="p-4 text-center">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-mono text-sm font-semibold">
                  {aluno.matricula}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FaUserGraduate size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{aluno.nome}</div>
                    <div className="text-xs text-gray-400">
                      {aluno.telefone && <span>📞 {aluno.telefone}</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-sm">
                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {aluno.nome_curso || 'Não informado'}
                </span>
              </td>
              <td className="p-4 text-center text-gray-600 font-medium">
                {aluno.turma || '-'}
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEditClick(aluno)} 
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Editar aluno"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(aluno.id_aluno)} 
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir aluno"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {alunos.length === 0 && (
            <tr>
              <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                Nenhum aluno encontrado no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AlunoList;