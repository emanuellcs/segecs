import React, { useState, useEffect } from 'react';
import AlunoForm from '../components/AlunoForm';
import AlunoList from '../components/AlunoList';
import { FaUserGraduate } from 'react-icons/fa';

function CadastroAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/alunos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAlunos(data))
      .catch(error => console.error("Erro ao buscar alunos", error));
  }, []);

  const handleEditClick = (aluno) => {
    setEditandoId(aluno.id_aluno);
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
  };

  const handleSuccess = () => {
    setRefresh(refresh + 1);
    setEditandoId(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaUserGraduate className="text-blue-600" />
        Gestão de Alunos
      </h1>

      <AlunoForm
        onSuccess={handleSuccess}
        alunoParaEditar={alunos.find(a => a.id_aluno === editandoId)}
        onCancel={handleCancelEdit}
      />

      <AlunoList
        refresh={refresh}
        onEditClick={handleEditClick}
      />
    </div>
  );
}

export default CadastroAlunos;