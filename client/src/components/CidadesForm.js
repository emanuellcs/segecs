import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

const LISTA_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function CidadesForm({ onSuccess, cidadeParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    cidade: '',
    uf: '',
    observacoes: ''
  });

  useEffect(() => {
    if (cidadeParaEditar) {
      setFormData({
        cidade: cidadeParaEditar.cidade || '',
        uf: cidadeParaEditar.uf || '',
        observacoes: cidadeParaEditar.observacoes || ''
      });
    } else {
      setFormData({ cidade: '', uf: '', observacoes: '' });
    }
  }, [cidadeParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cidade.trim() || !formData.uf) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Preencha o nome da cidade e a UF.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = cidadeParaEditar ? 'PUT' : 'POST';
    const url = cidadeParaEditar 
      ? `/api/cidades/${cidadeParaEditar.id_cidade}` 
      : '/api/cidades';

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
          title: cidadeParaEditar ? 'Cidade atualizada!' : 'Cidade cadastrada!'
        });
        onSuccess();
        if (!cidadeParaEditar) setFormData({ cidade: '', uf: '', observacoes: '' });
      } else {
        const errorData = await response.json();
        Swal.fire('Erro!', errorData.error || 'Falha ao salvar.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro!', 'Falha na conexão com o servidor.', 'error');
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md mb-8 transition-all border-l-8 
      ${cidadeParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${cidadeParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        <FaMapMarkerAlt />
        {cidadeParaEditar ? 'Editando Cidade' : 'Nova Cidade'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          
          {/* Campo Cidade */}
          <div className="md:col-span-8">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome da Cidade *</label>
            <input 
              type="text" 
              value={formData.cidade}
              onChange={(e) => setFormData({...formData, cidade: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Crateús"
              required
            />
          </div>

          {/* Campo UF */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">UF *</label>
            <select
              value={formData.uf}
              onChange={(e) => setFormData({...formData, uf: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              required
            >
              <option value="">--</option>
              {LISTA_UFS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div className="md:col-span-12">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              rows="2"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {cidadeParaEditar ? (
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

export default CidadesForm;