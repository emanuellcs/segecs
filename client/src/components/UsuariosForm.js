import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function UsuariosForm({ onSuccess, usuarioParaEditar, onCancel, niveis }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    id_nivel: ''
  });

  useEffect(() => {
    if (usuarioParaEditar) {
      setFormData({
        nome_completo: usuarioParaEditar.nome_completo || '',
        email: usuarioParaEditar.email || '',
        senha: '', // Senha geralmente não se preenche na edição por segurança
        id_nivel: usuarioParaEditar.id_nivel || ''
      });
    } else {
      setFormData({ nome_completo: '', email: '', senha: '', id_nivel: '' });
    }
  }, [usuarioParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome_completo.trim() || !formData.email.trim() || (!usuarioParaEditar && !formData.senha)) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha todos os campos necessários.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = usuarioParaEditar ? 'PUT' : 'POST';
    const url = usuarioParaEditar 
      ? `/api/usuarios/${usuarioParaEditar.id_usuario}` 
      : '/api/usuarios';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Toast.fire({
          icon: 'success',
          title: usuarioParaEditar ? 'Usuário atualizado!' : 'Usuário cadastrado!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Erro no Servidor',
          text: errorData.error || 'Não foi possível salvar os dados.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Falha na Conexão',
        text: 'Verifique se o servidor está online.'
      });
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md mb-8 transition-all border-l-8 
      ${usuarioParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${usuarioParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {usuarioParaEditar ? '✏️ Editando Usuário' : '➕ Cadastrar Novo Usuário'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome Completo *</label>
            <input 
              type="text" 
              value={formData.nome_completo}
              onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email (Login) *</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {!usuarioParaEditar && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Senha *</label>
              <input 
                type="password" 
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nível de Acesso *</label>
            <select
              value={formData.id_nivel}
              onChange={(e) => setFormData({...formData, id_nivel: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              required
            >
              <option value="">Selecione...</option>
              {niveis.map(n => (
                <option key={n.id_nivel} value={n.id_nivel}>{n.nivel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {usuarioParaEditar ? (
            <>
              <button type="submit" className="px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                <FaSave /> Salvar
              </button>
              <button type="button" onClick={onCancel} className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                <FaTimes /> Cancelar
              </button>
            </>
          ) : (
            <button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
              <FaPlus /> Adicionar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UsuariosForm;