import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '@/services/api';
import CidadesForm from '@/features/cidades/components/CidadesForm';
import CidadesList from '@/features/cidades/components/CidadesList';

function CadastroCidades() {
  const [cidades, setCidades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/cidades');
        setCidades(res.data);
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleEditClick = (cidade) => setEditandoId(cidade.id_cidade);
  const handleCancelEdit = () => setEditandoId(null);
  const handleSuccess = () => {
    setRefresh(refresh + 1);
    setEditandoId(null);
  };

  if (loading && refresh === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 uppercase tracking-tight">
            <FaMapMarkerAlt className="text-blue-600" />
            Cidades
          </h1>
          <p className="text-gray-500 font-medium">Gerenciamento de municípios atendidos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            {editandoId ? 'Editar Cidade' : 'Nova Cidade'}
          </h2>
          <CidadesForm
            onSuccess={handleSuccess}
            cidadeParaEditar={cidades.find((c) => c.id_cidade === editandoId)}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            Lista de Cidades
          </h2>
          <CidadesList
            refresh={refresh}
            onEditClick={handleEditClick}
            setCidades={setCidades}
            cidades={cidades}
          />
        </section>
      </div>
    </div>
  );
}

export default CadastroCidades;
