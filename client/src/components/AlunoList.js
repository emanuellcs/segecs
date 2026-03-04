import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserGraduate, FaCircle } from 'react-icons/fa';
import { confirmDelete } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

function AlunoList({ refresh, onEditClick, setAlunos, alunos }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlunos();
  }, [refresh, setAlunos]);

  const handleDelete = async (id) => {
    const result = await confirmDelete('Excluir Aluno?', 'Deseja realmente remover este aluno?');
    if (result.isConfirmed) {
      try {
        await api.delete(`/alunos/${id}`);
        setAlunos(alunos.filter((a) => a.id_aluno !== id));
        Swal.fire('Deletado!', 'Aluno removido com sucesso.', 'success');
      } catch (error) {
        const msg = error.response?.data?.message || 'Não foi possível excluir.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };

  if (loading && alunos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando alunos...</p>
      </div>
    );
  }

  if (alunos.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Nenhum aluno cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-4 py-4">Matrícula</th>
            <th className="px-4 py-4">Aluno</th>
            <th className="px-4 py-4">Curso / Turma</th>
            <th className="px-4 py-4">Contato</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {alunos.map((aluno) => (
            <tr key={aluno.id_aluno} className="group hover:bg-gray-50/50 transition-all">
              <td className="px-4 py-5">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-black font-mono">
                  {aluno.matricula}
                </span>
              </td>
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <FaUserGraduate size={16} />
                  </div>
                  <span className="font-bold text-gray-700">{aluno.nome}</span>
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="text-sm font-bold text-gray-700">
                  {aluno.nome_curso || <span className="text-gray-300">N/A</span>}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {aluno.turma || 'Sem turma'}
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="text-sm text-gray-600 font-medium">
                  {aluno.telefone || <span className="text-gray-300">Sem telefone</span>}
                </div>
                <div className="text-xs text-blue-500 lowercase">{aluno.email}</div>
              </td>
              <td className="px-4 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditClick(aluno)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(aluno.id_aluno)}
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

export default AlunoList;
