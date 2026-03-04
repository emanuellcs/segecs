import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import CursosForm from '@/features/cursos/components/CursosForm';
import CursosList from '@/features/cursos/components/CursosList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function CursosPage() {
  const [cursos, setCursos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await api.get('/cursos');
        setCursos(response.data);
      } catch (error) {
        console.error("Erro ao buscar cursos", error);
      }
    };
    fetchCursos();
  }, [refresh]);

  const handleEditClick = (curso) => {
    setEditandoId(curso.id_curso);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditandoId(null);
    setShowForm(false);
  };

  const handleSuccess = () => {
    setRefresh(prev => prev + 1);
    setEditandoId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader 
        title="Gestão de Cursos" 
        subtitle="Gerencie os cursos técnicos e de graduação do sistema."
        icon={FaBook}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Novo Curso
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? "Editar Curso" : "Novo Curso"}>
          <CursosForm
            onSuccess={handleSuccess}
            cursoParaEditar={cursos.find(c => c.id_curso === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Cursos Cadastrados">
        <CursosList
          cursos={cursos}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh(prev => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default CursosPage;
