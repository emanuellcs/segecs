import React, { useState, useEffect } from 'react';
import { FaCity, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import CidadesForm from '@/features/cidades/components/CidadesForm';
import CidadesList from '@/features/cidades/components/CidadesList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function CidadesPage() {
  const [cidades, setCidades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCidades = async () => {
      try {
        const response = await api.get('/cidades');
        setCidades(response.data);
      } catch (error) {
        console.error('Erro ao buscar cidades', error);
      }
    };
    fetchCidades();
  }, [refresh]);

  const handleEditClick = (cidade) => {
    setEditandoId(cidade.id_cidade);
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
        title="Municípios"
        subtitle="Gerencie as cidades e estados atendidos pelo sistema."
        icon={FaCity}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Nova Cidade
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? 'Editar Cidade' : 'Nova Cidade'}>
          <CidadesForm
            onSuccess={handleSuccess}
            cidadeParaEditar={cidades.find((c) => c.id_cidade === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Cidades Atendidas">
        <CidadesList
          cidades={cidades}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh((prev) => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default CidadesPage;
