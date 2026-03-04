import React, { useState, useEffect } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import api from '../services/api';
import NiveisForm from '../components/NiveisForm';
import NiveisList from '../components/NiveisList';

function CadastroNiveis() {
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/niveis');
        setNiveis(res.data);
      } catch (err) {
        console.error("Erro ao carregar níveis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleEditClick = (nivel) => setEditandoId(nivel.id_nivel);
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
            <FaShieldAlt className="text-blue-600" />
            Níveis de Acesso
          </h1>
          <p className="text-gray-500 font-medium">Gerenciamento de permissões e perfis do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            {editandoId ? 'Editar Nível' : 'Novo Nível'}
          </h2>
          <NiveisForm
            onSuccess={handleSuccess}
            nivelParaEditar={niveis.find(n => n.id_nivel === editandoId)}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            Lista de Níveis
          </h2>
          <NiveisList
            refresh={refresh}
            onEditClick={handleEditClick}
            setNiveis={setNiveis}
            niveis={niveis}
          />
        </section>
      </div>
    </div>
  );
}

export default CadastroNiveis;
