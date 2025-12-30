// Adicione no topo:
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers'; // Importando o Toast que configuramos

function CursosForm({ onSuccess, cursoParaEditar, onCancel }) {
  // Ajustado para refletir as colunas exatas do banco de dados (schema.sql)
  const [formData, setFormData] = useState({
    nome_curso: '',
    eixo_curso: '', // Obrigatório conforme o erro
    observacoes: ''
  });

  useEffect(() => {
    if (cursoParaEditar) {
      setFormData({
        nome_curso: cursoParaEditar.nome_curso || '',
        eixo_curso: cursoParaEditar.eixo_curso || '',
        observacoes: cursoParaEditar.observacoes || ''
      });
    } else {
      setFormData({ nome_curso: '', eixo_curso: '', observacoes: '' });
    }
  }, [cursoParaEditar]);

const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validação local antes de enviar
    if (!formData.nome_curso.trim() || !formData.eixo_curso.trim()) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha o Nome e o Eixo do curso.'
      });
      return; // Interrompe a execução aqui
    }

    const token = localStorage.getItem('token');
    const method = cursoParaEditar ? 'PUT' : 'POST';
    const url = cursoParaEditar 
      ? `/api/cursos/${cursoParaEditar.id_curso}` 
      : '/api/cursos';

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
          title: cursoParaEditar ? 'Curso atualizado!' : 'Curso cadastrado!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        // Erro retornado pelo servidor (ex: violação de constraint no banco)
        Swal.fire({
          icon: 'error',
          title: 'Erro no Servidor',
          text: errorData.error || 'Não foi possível salvar os dados.'
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
      ${cursoParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${cursoParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {cursoParaEditar ? '✏️ Editando Curso' : '➕ Cadastrar Novo Curso'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        
          {/* Nome do Curso */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome do Curso *</label>
            <input 
              type="text" 
              value={formData.nome_curso}
              onChange={(e) => setFormData({...formData, nome_curso: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Informática"
              required
            />
          </div>

          {/* Eixo Tecnológico (Campo obrigatório no banco) */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Eixo Tecnológico *</label>
            <input 
              type="text" 
              value={formData.eixo_curso}
              onChange={(e) => setFormData({...formData, eixo_curso: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ex: Informação e Comunicação"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Descrição</label>
            <input 
              type="text" 
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Notas adicionais..."
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 justify-end">
          {cursoParaEditar ? (
            <>
              <button type="submit" className="px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                <FaSave /> Salvar
              </button>
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
              >
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

export default CursosForm;