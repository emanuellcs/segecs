import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import AlunoForm from '@/features/alunos/components/AlunoForm';
import AlunoList from '@/features/alunos/components/AlunoList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function AlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch (error) {
        console.error('Erro ao buscar alunos', error);
      }
    };
    fetchAlunos();
  }, [refresh]);

  const handleEditClick = (aluno) => {
    setEditandoId(aluno.id_aluno);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditandoId(null);
    setShowForm(false);
  };

  const handleSuccess = () => {
    setRefresh((prev) => prev + 1);
    setEditandoId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Gestão de Alunos"
        subtitle="Cadastre e gerencie os dados dos alunos estagiários."
        icon={FaUserGraduate}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Novo Aluno
            </Button>
          )
        }
      />

      {showForm && (
        <Card
          title={editandoId ? 'Editar Aluno' : 'Novo Cadastro'}
          description="Preencha as informações básicas e de contato."
        >
          <AlunoForm
            onSuccess={handleSuccess}
            alunoParaEditar={alunos.find((a) => a.id_aluno === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Lista de Alunos" description="Todos os alunos matriculados no sistema.">
        <AlunoList
          alunos={alunos}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh((prev) => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default AlunosPage;
