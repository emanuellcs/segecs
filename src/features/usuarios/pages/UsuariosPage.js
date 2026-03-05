import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import api from '@/services/api';
import UsuariosForm from '@/features/usuarios/components/UsuariosForm';
import UsuariosList from '@/features/usuarios/components/UsuariosList';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUsers, resNiveis] = await Promise.all([api.get('/usuarios'), api.get('/niveis')]);
        setUsuarios(resUsers.data);
        setNiveis(resNiveis.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    fetchData();
  }, [refresh]);

  const handleEditClick = (user) => {
    setEditandoId(user.id_usuario);
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
        title="Controle de Acesso"
        subtitle="Gerencie os usuários do sistema e seus respectivos níveis de permissão."
        icon={FaUsers}
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} icon={FaPlus}>
              Novo Usuário
            </Button>
          )
        }
      />

      {showForm && (
        <Card title={editandoId ? 'Editar Usuário' : 'Novo Usuário'}>
          <UsuariosForm
            onSuccess={handleSuccess}
            usuarioParaEditar={usuarios.find((u) => u.id_usuario === editandoId)}
            onCancel={handleCancel}
            niveis={niveis}
          />
        </Card>
      )}

      <Card title="Usuários Ativos">
        <UsuariosList
          usuarios={usuarios}
          onEditClick={handleEditClick}
          onDeleteSuccess={() => setRefresh((prev) => prev + 1)}
        />
      </Card>
    </div>
  );
}

export default UsuariosPage;
