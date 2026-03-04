import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import { IMaskInput } from 'react-imask';

function ResponsaveisForm({ onSuccess, responsavelParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    rg: '',
    cpf: '',
    telefone: '',
    id_cidade: '',
    bairro: '',
    observacoes: '',
  });
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCidades = async () => {
      try {
        const res = await api.get('/cidades');
        setCidades(res.data);
      } catch (err) {
        console.error('Erro ao buscar cidades:', err);
      }
    };
    fetchCidades();

    if (responsavelParaEditar) {
      setFormData({
        nome: responsavelParaEditar.nome || '',
        rg: responsavelParaEditar.rg || '',
        cpf: responsavelParaEditar.cpf || '',
        telefone: responsavelParaEditar.telefone || '',
        id_cidade: responsavelParaEditar.id_cidade || '',
        bairro: responsavelParaEditar.bairro || '',
        observacoes: responsavelParaEditar.observacoes || '',
      });
    } else {
      setFormData({
        nome: '',
        rg: '',
        cpf: '',
        telefone: '',
        id_cidade: '',
        bairro: '',
        observacoes: '',
      });
    }
  }, [responsavelParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (responsavelParaEditar) {
        await api.put(`/responsaveis/${responsavelParaEditar.id_responsavel}`, formData);
        Toast.fire({ icon: 'success', title: 'Responsável atualizado com sucesso!' });
      } else {
        await api.post('/responsaveis', formData);
        Toast.fire({ icon: 'success', title: 'Responsável cadastrado com sucesso!' });
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao processar solicitação.';
      Swal.fire({ icon: 'error', title: 'Erro', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: João da Silva"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Telefone
          </label>
          <IMaskInput
            mask="(00) 00000-0000"
            value={formData.telefone}
            onAccept={(value) => setFormData({ ...formData, telefone: value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">RG</label>
          <input
            type="text"
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: 1234567"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CPF</label>
          <IMaskInput
            mask="000.000.000-00"
            value={formData.cpf}
            onAccept={(value) => setFormData({ ...formData, cpf: value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="000.000.000-00"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade</label>
          <select
            value={formData.id_cidade}
            onChange={(e) => setFormData({ ...formData, id_cidade: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
          >
            <option value="">Selecione a cidade...</option>
            {cidades.map((c) => (
              <option key={c.id_cidade} value={c.id_cidade}>
                {c.cidade} - {c.uf}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bairro</label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Centro"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            rows="2"
            placeholder="Notas adicionais..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        {responsavelParaEditar ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FaTimes /> Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Responsável'}
          </button>
        )}
      </div>
    </form>
  );
}

export default ResponsaveisForm;
