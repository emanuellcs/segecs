import React, { useState, useEffect } from 'react';
import { FaBook } from 'react-icons/fa';
import api from '@/services/api';
import CursosForm from '@/features/cursos/components/CursosForm';
import CursosList from '@/features/cursos/components/CursosList';

function CadastroCursos() {
  const [cursos, setCursos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/cursos');
        setCursos(res.data);
      } catch (err) {
        console.error('Erro ao carregar cursos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleEditClick = (curso) => setEditandoId(curso.id_curso);
  const handleCancelEdit = () => setEditandoId(null);
  const handleSuccess = () => {
    setRefresh(refresh + 1);
    setEditandoId(null);
  };

  if (loading && refresh === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 uppercase tracking-tight">
            <FaBook className="text-blue-600" />
            Cursos
          </h1>
          <p className="text-gray-500 font-medium">Gerenciamento de cursos e eixos tecnológicos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            {editandoId ? 'Editar Curso' : 'Novo Curso'}
          </h2>
          <CursosForm
            onSuccess={handleSuccess}
            cursoParaEditar={cursos.find((c) => c.id_curso === editandoId)}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            Lista de Cursos
          </h2>
          <CursosList
            refresh={refresh}
            onEditClick={handleEditClick}
            setCursos={setCursos}
            cursos={cursos}
          />
        </section>
      </div>
    </div>
  );
}

export default CadastroCursos;
