import React, { useState, useEffect } from 'react';
import EscolasForm from '../components/EscolasForm';
import EscolasList from '../components/EscolasList';
import { FaSchool } from 'react-icons/fa';

function CadastroEscolas() {
  const [escolas, setEscolas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/escolas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEscolas(data))
      .catch(error => console.error("Erro ao buscar escolas", error));
  }, []);

  const handleEditClick = (escola) => {
    setEditandoId(escola.id_escola);
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
        <FaSchool className="text-blue-600" />
        Gestão de Escolas
      </h1>

      <EscolasForm
        onSuccess={handleSuccess}
        escolaParaEditar={escolas.find(e => e.id_escola === editandoId)}
        onCancel={handleCancelEdit}
      />

      <EscolasList
        refresh={refresh}
        onEditClick={handleEditClick}
      />
    </div>
  );
}

export default CadastroEscolas;