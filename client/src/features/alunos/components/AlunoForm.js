import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import { IMaskInput } from 'react-imask';

const initialData = {
  matricula: '',
  nome: '',
  rg: '',
  cpf: '',
  nasc: '',
  telefone: '',
  email: '',
  id_cidade: '',
  bairro: '',
  zona: '',
  id_curso: '',
  turma: '',
  observacoes: '',
  inform_egressa: '',
  facebook: '',
  linkedin: '',
  github: '',
};

function AlunoForm({ onSuccess, alunoParaEditar, onCancel }) {
  const [formData, setFormData] = useState(initialData);
  const [cidades, setCidades] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCidades, resCursos] = await Promise.all([
          api.get('/cidades'),
          api.get('/cursos'),
        ]);
        setCidades(resCidades.data);
        setCursos(resCursos.data);
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
      }
    };
    fetchData();

    if (alunoParaEditar) {
      setFormData({
        ...alunoParaEditar,
        nasc: alunoParaEditar.nasc ? alunoParaEditar.nasc.split('T')[0] : '',
        id_cidade: alunoParaEditar.id_cidade || '',
        id_curso: alunoParaEditar.id_curso || '',
      });
    } else {
      setFormData(initialData);
    }
  }, [alunoParaEditar]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (alunoParaEditar) {
        await api.put(`/alunos/${alunoParaEditar.id_aluno}`, formData);
        Toast.fire({ icon: 'success', title: 'Aluno atualizado com sucesso!' });
      } else {
        await api.post('/alunos', formData);
        Toast.fire({ icon: 'success', title: 'Aluno cadastrado com sucesso!' });
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Dados Pessoais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Nome do aluno"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Matrícula
            </label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Ex: 2025001"
              required
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
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">RG</label>
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="RG do aluno"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="nasc"
              value={formData.nasc}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              required
            />
          </div>
        </div>
      </div>

      {/* Localização e Contato */}
      <div>
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Localização e Contato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="exemplo@email.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Cidade
            </label>
            <select
              name="id_cidade"
              value={formData.id_cidade}
              onChange={handleChange}
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
              Bairro
            </label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Bairro"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zona</label>
            <select
              name="zona"
              value={formData.zona}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="Urbana">Urbana</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acadêmico */}
      <div>
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Informações Acadêmicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Curso
            </label>
            <select
              name="id_curso"
              value={formData.id_curso}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            >
              <option value="">Selecione o curso...</option>
              {cursos.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.nome_curso}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Turma
            </label>
            <input
              type="text"
              name="turma"
              value={formData.turma}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Ex: 3º A"
            />
          </div>
        </div>
      </div>

      {/* Social e Outros */}
      <div>
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Redes Sociais e Observações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaFacebook className="text-blue-600" /> Facebook
            </label>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="URL do perfil"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaLinkedin className="text-blue-700" /> LinkedIn
            </label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="URL do perfil"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaGithub className="text-gray-900" /> GitHub
            </label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="URL do perfil"
            />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Observações Gerais
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                rows="2"
                placeholder="Notas internas..."
              ></textarea>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Informações Egresso
              </label>
              <textarea
                name="inform_egressa"
                value={formData.inform_egressa}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                rows="2"
                placeholder="Situação após curso..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        {alunoParaEditar ? (
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
            <FaPlus /> {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
          </button>
        )}
      </div>
    </form>
  );
}

export default AlunoForm;
