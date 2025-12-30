import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function NiveisForm({ onSuccess, nivelParaEditar, onCancel }) {
  const [formData, setFormData] = useState({ nivel: '', descricao: '' });

  useEffect(() => {
    if (nivelParaEditar) {
      setFormData({
        nivel: nivelParaEditar.nivel || '',
        descricao: nivelParaEditar.descricao || ''
      });
    } else {
      setFormData({ nivel: '', descricao: '' });
    }
  }, [nivelParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação local
    if (!formData.nivel.trim()) {
      Toast.fire({
        icon: 'error',
        title: 'Campo obrigatório!',
        text: 'Por favor, preencha o Nome do Nível.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = nivelParaEditar ? 'PUT' : 'POST';
    const url = nivelParaEditar 
      ? `/api/niveis/${nivelParaEditar.id_nivel}` 
      : '/api/niveis';

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
          title: nivelParaEditar ? 'Nível atualizado!' : 'Nível cadastrado!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        
        let errorMessage = errorData.error || 'Não foi possível salvar os dados.';
        
        if (errorMessage.includes('já existe') || errorMessage.includes('existe outro')) {
          errorMessage = 'Já existe um nível cadastrado com este nome.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Erro no Cadastro',
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      Swal.fire({
        icon: 'error',
        title: 'Falha na Conexão',
        text: 'Verifique se o servidor está online.'
      });
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md mb-8 transition-all border-l-8 
      ${nivelParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${nivelParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {nivelParaEditar ? '✏️ Editando Nível' : '➕ Cadastrar Novo Nível'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          
          {/* Nome do Nível */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome do Nível *</label>
            <input 
              type="text" 
              value={formData.nivel}
              onChange={(e) => setFormData({...formData, nivel: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Administrador"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Descrição</label>
            <input 
              type="text" 
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="O que este nível pode fazer?"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          {nivelParaEditar ? (
            <>
              <button 
                type="submit"
                className="px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded flex items-center gap-2"
              >
                <FaSave /> Salvar Alterações
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded flex items-center gap-2"
              >
                <FaTimes /> Cancelar
              </button>
            </>
          ) : (
            <button 
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded flex items-center gap-2"
            >
              <FaPlus /> Adicionar Nível
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default NiveisForm;