import React, { useState, useEffect } from 'react';
import { FaUserFriends } from 'react-icons/fa';
import UsuariosForm from '../components/UsuariosForm';
import UsuariosList from '../components/UsuariosList';

function CadastroUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Carrega níveis para o formulário
    fetch('/api/niveis', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setNiveis(data))
      .catch(err => console.error("Erro ao carregar níveis", err));
  }, []);

  const handleEditClick = (user) => setEditandoId(user.id_usuario);
  const handleCancelEdit = () => setEditandoId(null);
  const handleSuccess = () => {
    setRefresh(refresh + 1);
    setEditandoId(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaUserFriends className="text-blue-600" />
        Gerenciar Usuários
      </h1>

      <UsuariosForm
        onSuccess={handleSuccess}
        usuarioParaEditar={usuarios.find(u => u.id_usuario === editandoId)} 
        onCancel={handleCancelEdit}
        niveis={niveis}
      />

      <UsuariosList
        refresh={refresh}
        onEditClick={handleEditClick}
        setUsuarios={setUsuarios} // Passa a função para preencher a lista
        usuarios={usuarios}       // Passa a lista atual para desenhar a tabela
      />
    </div>
  );
}

export default CadastroUsuarios;