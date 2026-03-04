import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import api from '../services/api';
import UsuariosForm from '../components/UsuariosForm';
import UsuariosList from '../components/UsuariosList';

function CadastroUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resNiveis = await api.get('/niveis');
        setNiveis(resNiveis.data);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (user) => setEditandoId(user.id_usuario);
  const handleCancelEdit = () => setEditandoId(null);
  const handleSuccess = () => {
    setRefresh(refresh + 1);
    setEditandoId(null);
  };

  if (loading) {
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
            <FaUsers className="text-blue-600" />
            Usuários
          </h1>
          <p className="text-gray-500 font-medium">Gerenciamento de acessos ao sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            {editandoId ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <UsuariosForm
            onSuccess={handleSuccess}
            usuarioParaEditar={usuarios.find(u => u.id_usuario === editandoId)} 
            onCancel={handleCancelEdit}
            niveis={niveis}
          />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50">
            Lista de Usuários
          </h2>
          <UsuariosList
            refresh={refresh}
            onEditClick={handleEditClick}
            setUsuarios={setUsuarios}
            usuarios={usuarios}
          />
        </section>
      </div>
    </div>
  );
}

export default CadastroUsuarios;
