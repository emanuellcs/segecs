import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '../services/api';

const LISTA_UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

function EscolasForm({ onSuccess, escolaParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    nome_escola: '',
    inep: '',
    id_cidade: '',
    uf: '',
    endereco_escola: '',
    telefone: '',
    email: '',
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

    if (escolaParaEditar) {
      setFormData({
        nome_escola: escolaParaEditar.nome_escola || '',
        inep: escolaParaEditar.inep || '',
        id_cidade: escolaParaEditar.id_cidade || '',
        uf: escolaParaEditar.uf || '',
        endereco_escola: escolaParaEditar.endereco_escola || '',
        telefone: escolaParaEditar.telefone || '',
        email: escolaParaEditar.email || '',
        observacoes: escolaParaEditar.observacoes || '',
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
        observacoes: '',
      });
    }
  }, [escolaParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (escolaParaEditar) {
        await api.put(`/escolas/${escolaParaEditar.id_escola}`, formData);
        Toast.fire({ icon: 'success', title: 'Escola atualizada com sucesso!' });
      } else {
        await api.post('/escolas', formData);
        Toast.fire({ icon: 'success', title: 'Escola cadastrada com sucesso!' });
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
            Nome da Escola
          </label>
          <input
            type="text"
            value={formData.nome_escola}
            onChange={(e) => setFormData({ ...formData, nome_escola: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: Escola Municipal Exemplo"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Código INEP
          </label>
          <input
            type="text"
            value={formData.inep}
            onChange={(e) => setFormData({ ...formData, inep: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Ex: 12345678"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade</label>
          <select
            value={formData.id_cidade}
            onChange={(e) => setFormData({ ...formData, id_cidade: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">Selecione a cidade...</option>
            {cidades.map((c) => (
              <option key={c.id_cidade} value={c.id_cidade}>
                {c.cidade} - {c.uf}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            UF (Localidade)
          </label>
          <select
            value={formData.uf}
            onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">--</option>
            {LISTA_UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Telefone
          </label>
          <input
            type="text"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="(00) 0000-0000"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Endereço
          </label>
          <input
            type="text"
            value={formData.endereco_escola}
            onChange={(e) => setFormData({ ...formData, endereco_escola: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="Rua, número, bairro..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="exemplo@escola.com"
          />
        </div>

        <div className="md:col-span-3 space-y-1">
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
        {escolaParaEditar ? (
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
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Escola'}
          </button>
        )}
      </div>
    </form>
  );
}

export default EscolasForm;
