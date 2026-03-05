import React, { useState, useEffect } from 'react';
import { FaUserTie, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import ResponsaveisForm from '@/features/responsaveis/components/ResponsaveisForm';
import ResponsaveisList from '@/features/responsaveis/components/ResponsaveisList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const response = await api.get('/responsaveis');
        setResponsaveis(response.data);
      } catch (error) {
        console.error('Erro ao buscar responsáveis', error);
      }
    };
    fetchResponsaveis();
  }, [refresh]);

  const handleEditClick = (resp) => {
    setEditandoId(resp.id_responsavel);
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
        title="Responsáveis"
        subtitle="Gerencie os responsáveis legais pelos alunos estagiários."
        icon={FaUserTie}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Novo Responsável
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? 'Editar Responsável' : 'Novo Cadastro'}>
          <ResponsaveisForm
            onSuccess={handleSuccess}
            responsavelParaEditar={responsaveis.find((r) => r.id_responsavel === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Lista de Responsáveis">
        <ResponsaveisList
          responsaveis={responsaveis}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh((prev) => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default ResponsaveisPage;
