import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function EscolasForm({ onSuccess, escolaParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome_escola: '',
    inep: '',
    id_cidade: '',
    uf: '',
    endereco_escola: '',
    telefone: '',
    email: '',
    observacoes: ''
  });

  const [cidades, setCidades] = useState([]);

  // Lista de UFs do Brasil
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    // Buscar cidades ao carregar o componente
    fetchCidades();

    if (escolaParaEditar) {
      setFormData({
        nome_escola: escolaParaEditar.nome_escola || '',
        inep: escolaParaEditar.inep || '',
        id_cidade: escolaParaEditar.id_cidade || '',
        uf: escolaParaEditar.uf || '',
        endereco_escola: escolaParaEditar.endereco_escola || '',
        telefone: escolaParaEditar.telefone || '',
        email: escolaParaEditar.email || '',
        observacoes: escolaParaEditar.observacoes || ''
      });
    } else {
      setFormData({ 
        nome_escola: '', 
        inep: '', 
        id_cidade: '',
        uf: '',
        endereco_escola: '', 
        telefone: '', 
        email: '', 
        observacoes: '' 
      });
    }
  }, [escolaParaEditar]);

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
    if (!formData.nome_escola.trim() || !formData.id_cidade || !formData.uf) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha o Nome da escola, Cidade e UF.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = escolaParaEditar ? 'PUT' : 'POST';
    const url = escolaParaEditar 
      ? `/api/escolas/${escolaParaEditar.id_escola}` 
      : '/api/escolas';

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
          title: escolaParaEditar ? 'Escola atualizada!' : 'Escola cadastrada!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        
        let errorMessage = errorData.error || 'Não foi possível salvar os dados.';
        
        if (errorMessage.includes('inep_key') || errorMessage.includes('INEP')) {
          errorMessage = 'Já existe uma escola cadastrada com este código INEP.';
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
      ${escolaParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${escolaParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {escolaParaEditar ? '✏️ Editando Escola' : '➕ Cadastrar Nova Escola'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* Nome da Escola */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome da Escola *</label>
            <input 
              type="text" 
              value={formData.nome_escola}
              onChange={(e) => setFormData({...formData, nome_escola: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Escola Municipal Exemplo"
              required
            />
          </div>

          {/* Código INEP */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Código INEP</label>
            <input 
              type="text" 
              value={formData.inep}
              onChange={(e) => setFormData({...formData, inep: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: 12345678"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade *</label>
            <select 
              value={formData.id_cidade}
              onChange={(e) => setFormData({...formData, id_cidade: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Selecione uma cidade</option>
              {cidades.map(cidade => (
                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                  {cidade.cidade} - {cidade.uf}
                </option>
              ))}
            </select>
          </div>

          {/* UF */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">UF *</label>
            <select 
              value={formData.uf}
              onChange={(e) => setFormData({...formData, uf: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Selecione</option>
              {ufs.map(uf => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Endereço</label>
            <input 
              type="text" 
              value={formData.endereco_escola}
              onChange={(e) => setFormData({...formData, endereco_escola: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Rua, número, bairro"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Telefone</label>
            <input 
              type="text" 
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="(00) 1234-5678"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">E-mail</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="exemplo@escola.com"
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
          {escolaParaEditar ? (
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
              <FaPlus /> Adicionar Escola
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EscolasForm;