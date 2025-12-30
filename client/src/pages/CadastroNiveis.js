import React, { useState, useEffect } from 'react';
import NiveisForm from '../components/NiveisForm';
import NiveisList from '../components/NiveisList';
import { FaShieldAlt } from 'react-icons/fa';

function CadastroNiveis() {
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/niveis', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNiveis(data))
      .catch(error => console.error("Erro ao buscar níveis", error));
  }, []);

  const handleEditClick = (nivel) => {
    setEditandoId(nivel.id_nivel);
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
        <FaShieldAlt className="text-blue-600" />
        Gestão de Níveis de Acesso
      </h1>

      <NiveisForm
        onSuccess={handleSuccess}
        nivelParaEditar={niveis.find(n => n.id_nivel === editandoId)}
        onCancel={handleCancelEdit}
      />

      <NiveisList
        refresh={refresh}
        onEditClick={handleEditClick}
      />
    </div>
  );
}

export default CadastroNiveis;