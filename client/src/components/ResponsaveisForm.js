import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import { IMaskInput } from 'react-imask';

function ResponsaveisForm({ onSuccess, responsavelParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    rg: '',
    cpf: '',
    telefone: '',
    id_cidade: '',
    bairro: '',
    observacoes: ''
  });

  const [cidades, setCidades] = useState([]);

  useEffect(() => {
    // Buscar cidades ao carregar o componente
    fetchCidades();

    if (responsavelParaEditar) {
      setFormData({
        nome: responsavelParaEditar.nome || '',
        rg: responsavelParaEditar.rg || '',
        cpf: responsavelParaEditar.cpf || '',
        telefone: responsavelParaEditar.telefone || '',
        id_cidade: responsavelParaEditar.id_cidade || '',
        bairro: responsavelParaEditar.bairro || '',
        observacoes: responsavelParaEditar.observacoes || ''
      });
    } else {
      setFormData({ 
        nome: '', 
        rg: '', 
        cpf: '', 
        telefone: '', 
        id_cidade: '',
        bairro: '', 
        observacoes: '' 
      });
    }
  }, [responsavelParaEditar]);

  const fetchCidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cidades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação local
    if (!formData.nome.trim() || !formData.telefone.trim()) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha o Nome e Telefone.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = responsavelParaEditar ? 'PUT' : 'POST';
    const url = responsavelParaEditar 
      ? `/api/responsaveis/${responsavelParaEditar.id_responsavel}` 
      : '/api/responsaveis';

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
          title: responsavelParaEditar ? 'Responsável atualizado!' : 'Responsável cadastrado!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        
        let errorMessage = errorData.error || 'Não foi possível salvar os dados.';
        
        if (errorMessage.includes('cpf_key') || errorMessage.includes('CPF')) {
          errorMessage = 'Já existe um responsável cadastrado com este CPF.';
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
      ${responsavelParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${responsavelParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {responsavelParaEditar ? '✏️ Editando Responsável' : '➕ Cadastrar Novo Responsável'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome Completo *</label>
            <input 
              type="text" 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: João da Silva"
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Telefone *</label>
            <IMaskInput
              mask="(00)00000-0000"
              value={formData.telefone}
              onAccept={(value) => setFormData({...formData, telefone: value})}
              placeholder="(00)00000-0000"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* RG */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">RG</label>
            <input 
              type="text" 
              value={formData.rg}
              onChange={(e) => setFormData({...formData, rg: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: 1234567"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">CPF</label>
            <input 
              type="text" 
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="000.000.000-00"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade</label>
            <select 
              value={formData.id_cidade}
              onChange={(e) => setFormData({...formData, id_cidade: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Selecione uma cidade</option>
              {cidades.map(cidade => (
                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                  {cidade.cidade} - {cidade.uf}
                </option>
              ))}
            </select>
          </div>

          {/* Bairro */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Bairro</label>
            <input 
              type="text" 
              value={formData.bairro}
              onChange={(e) => setFormData({...formData, bairro: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Centro"
            />
          </div>

          {/* Observações */}
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Observações</label>
            <input 
              type="text" 
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Notas adicionais..."
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          {responsavelParaEditar ? (
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
              <FaPlus /> Adicionar Responsável
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ResponsaveisForm;