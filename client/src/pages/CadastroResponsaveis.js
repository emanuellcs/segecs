import React, { useState, useEffect } from 'react';
import ResponsaveisForm from '../components/ResponsaveisForm';
import ResponsaveisList from '../components/ResponsaveisList';
import { FaUserTie } from 'react-icons/fa';

function CadastroResponsaveis() {
  const [responsaveis, setResponsaveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/responsaveis', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResponsaveis(data))
      .catch(error => console.error("Erro ao buscar responsáveis", error));
  }, []);

  const handleEditClick = (responsavel) => {
    setEditandoId(responsavel.id_responsavel);
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
        <FaUserTie className="text-blue-600" />
        Gestão de Responsáveis
      </h1>

      <ResponsaveisForm
        onSuccess={handleSuccess}
        responsavelParaEditar={responsaveis.find(r => r.id_responsavel === editandoId)}
        onCancel={handleCancelEdit}
      />

      <ResponsaveisList
        refresh={refresh}
        onEditClick={handleEditClick}
      />
    </div>
  );
}

export default CadastroResponsaveis;