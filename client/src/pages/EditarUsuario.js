import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// REMOVI O IMPORT DO SIDEBAR DAQUI

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    id_nivel: 2,
    ativo: true
  });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          headers: { 'Authorization': getToken() }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            nome_completo: data.nome_completo,
            email: data.email,
            senha: '',
            id_nivel: data.id_nivel,
            ativo: data.ativo
          });
        } else {
          alert('Erro ao carregar usuário');
          navigate('/usuarios');
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    fetchUsuario();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        navigate('/usuarios');
      } else {
        const err = await response.json();
        alert('Erro ao atualizar: ' + (err.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  // --- CORREÇÃO FINAL NO RETURN ---
  // Removi a Sidebar e a div "flex" que envolvia a tela toda.
  // Deixei apenas o container do conteúdo.
  return (
    <div className="max-w-4xl mx-auto mt-6"> 
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Nome Completo</label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Nova Senha (Opcional)</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Deixe em branco para manter a atual"
              className="w-full p-2 border border-gray-300 rounded bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Só preencha se quiser alterar a senha.</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Nível de Acesso</label>
            <select
              name="id_nivel"
              value={formData.id_nivel}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="1">Administrador</option>
              <option value="2">Orientador</option>
              <option value="3">Aluno</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Status</label>
            <select
              name="ativo"
              value={formData.ativo}
              onChange={(e) => setFormData({...formData, ativo: e.target.value === 'true'})}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo (Bloqueado)</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarUsuario;