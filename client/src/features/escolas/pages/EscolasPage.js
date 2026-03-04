import React, { useState, useEffect } from 'react';
import { FaSchool, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import EscolasForm from '@/features/escolas/components/EscolasForm';
import EscolasList from '@/features/escolas/components/EscolasList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function EscolasPage() {
  const [escolas, setEscolas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const response = await api.get('/escolas');
        setEscolas(response.data);
      } catch (error) {
        console.error("Erro ao buscar escolas", error);
      }
    };
    fetchEscolas();
  }, [refresh]);

  const handleEditClick = (escola) => {
    setEditandoId(escola.id_escola);
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
        title="Escolas" 
        subtitle="Gerencie as instituições de ensino cadastradas."
        icon={FaSchool}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Nova Escola
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? "Editar Escola" : "Nova Escola"}>
          <EscolasForm
            onSuccess={handleSuccess}
            escolaParaEditar={escolas.find(e => e.id_escola === editandoId)}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card title="Instituições Cadastradas">
        <EscolasList
          escolas={escolas}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh(prev => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default EscolasPage;
