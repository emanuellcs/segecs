import React, { useState, useEffect } from 'react';
import CursosForm from '../components/CursosForm';
import CursosList from '../components/CursosList';
import { FaBook } from 'react-icons/fa';

function CadastroCursos() {
  const [cursos, setCursos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/cursos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch(error => console.error("Erro ao buscar cursos", error));
  }, []);

  const handleEditClick = (curso) => {
    setEditandoId(curso.id_curso);
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
        <FaBook className="text-blue-600" />
        Gestão de Cursos
      </h1>

      <CursosForm
        onSuccess={handleSuccess}
        cursoParaEditar={cursos.find(c => c.id_curso === editandoId)}
        onCancel={handleCancelEdit}
      />

      <CursosList
        refresh={refresh}
        onEditClick={handleEditClick}
      />
    </div>
  );
}

export default CadastroCursos;