import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import CidadesForm from '../components/CidadesForm';
import CidadesList from '../components/CidadesList';

function CadastroCidades() {
  const [cidades, setCidades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const handleEditClick = (cidade) => {
    setEditandoId(cidade.id_cidade);
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
        <FaMapMarkerAlt className="text-blue-600" />
        Gerenciar Cidades
      </h1>

      <CidadesForm
        onSuccess={handleSuccess}
        cidadeParaEditar={cidades.find(c => c.id_cidade === editandoId)}
        onCancel={handleCancelEdit}
      />

      <CidadesList
        refresh={refresh}
        onEditClick={handleEditClick}
        setCidades={setCidades}
        cidades={cidades}
      />
    </div>
  );
}

export default CadastroCidades;