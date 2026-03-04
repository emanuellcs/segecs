import React, { useState, useEffect } from 'react';
import { FaLayerGroup, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import NiveisForm from '@/features/niveis/components/NiveisForm';
import NiveisList from '@/features/niveis/components/NiveisList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function NiveisPage() {
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchNiveis = async () => {
      try {
        const response = await api.get('/niveis');
        setNiveis(response.data);
      } catch (error) {
        console.error("Erro ao buscar níveis", error);
      }
    };
    fetchNiveis();
  }, [refresh]);

  const handleEditClick = (nivel) => {
    setEditandoId(nivel.id_nivel);
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
        title="Níveis de Acesso" 
        subtitle="Defina os perfis de permissão do sistema."
        icon={FaLayerGroup}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Novo Nível
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? "Editar Nível" : "Novo Nível"}>
          <NiveisForm
            onSuccess={handleSuccess}
            nivelParaEditar={niveis.find(n => n.id_nivel === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Perfis Disponíveis">
        <NiveisList
          niveis={niveis}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh(prev => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default NiveisPage;
