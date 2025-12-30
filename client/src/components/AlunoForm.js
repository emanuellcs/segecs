import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Toast } from '../utils/swalHelpers';
import Swal from 'sweetalert2';

function AlunoForm({ onSuccess, alunoParaEditar, onCancel }) {
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
    github: ''
  };

  const [formData, setFormData] = useState(initialData);
  const [cidades, setCidades] = useState([]);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    fetchCidades();
    fetchCursos();
    
    if (alunoParaEditar) {
      const formattedDate = alunoParaEditar.nasc ? alunoParaEditar.nasc.split('T')[0] : '';
      setFormData({
        ...alunoParaEditar,
        nasc: formattedDate
      });
    } else {
      setFormData(initialData);
    }
  }, [alunoParaEditar]);

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

  const fetchCursos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação local
    if (!formData.nome.trim() || !formData.matricula.trim() || !formData.cpf.trim()) {
      Toast.fire({
        icon: 'error',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha Nome, Matrícula e CPF.'
      });
      return;
    }

    const token = localStorage.getItem('token');
    const method = alunoParaEditar ? 'PUT' : 'POST';
    const url = alunoParaEditar 
      ? `/api/alunos/${alunoParaEditar.id_aluno}` 
      : '/api/alunos';

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
          title: alunoParaEditar ? 'Aluno atualizado!' : 'Aluno cadastrado!'
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        
        // Tratamento específico para CPF duplicado
        let errorMessage = errorData.error || 'Não foi possível salvar os dados.';
        
        if (errorMessage.includes('cpf_key') || errorMessage.includes('CPF')) {
          errorMessage = 'Já existe um aluno cadastrado com este CPF.';
        } else if (errorMessage.includes('matricula_key') || errorMessage.includes('matrícula')) {
          errorMessage = 'Já existe um aluno cadastrado com esta matrícula.';
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
      ${alunoParaEditar ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-500'}`}>
      
      <h3 className={`font-bold text-lg mb-4 ${alunoParaEditar ? 'text-orange-700' : 'text-blue-700'}`}>
        {alunoParaEditar ? '✏️ Editando Aluno' : '➕ Cadastrar Novo Aluno'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Seção 1: Dados Pessoais */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Dados Pessoais</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                name="nome" 
                value={formData.nome} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nome completo do aluno"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Matrícula *</label>
              <input 
                type="text" 
                name="matricula" 
                value={formData.matricula} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Ex: 2025001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">RG</label>
              <input 
                type="text" 
                name="rg" 
                value={formData.rg} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Ex: 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">CPF *</label>
              <InputMask
                mask="999.999.999-99"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Data de Nascimento *</label>
              <input 
                type="date" 
                name="nasc" 
                value={formData.nasc} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Contato */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Contato</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Telefone</label>
              <InputMask
                mask="(99)99999-9999"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00)00000-0000"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Endereço */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Endereço</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade *</label>
              <select 
                name="id_cidade" 
                value={formData.id_cidade} 
                onChange={handleChange}
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

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Bairro</label>
              <input 
                type="text" 
                name="bairro" 
                value={formData.bairro} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Zona</label>
              <select 
                name="zona" 
                value={formData.zona} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Selecione</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 4: Acadêmico */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Informações Acadêmicas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Curso</label>
              <select 
                name="id_curso" 
                value={formData.id_curso} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Selecione um curso</option>
                {cursos.map(curso => (
                  <option key={curso.id_curso} value={curso.id_curso}>
                    {curso.nome_curso}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Turma</label>
              <input 
                type="text" 
                name="turma" 
                value={formData.turma} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Ex: 3º A"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Redes Sociais */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Redes Sociais</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Facebook</label>
              <input 
                type="url" 
                name="facebook" 
                value={formData.facebook} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="https://facebook.com/usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">LinkedIn</label>
              <input 
                type="url" 
                name="linkedin" 
                value={formData.linkedin} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">GitHub</label>
              <input 
                type="url" 
                name="github" 
                value={formData.github} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="https://github.com/usuario"
              />
            </div>
          </div>
        </div>

        {/* Seção 6: Observações */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Observações</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Observações Gerais</label>
              <textarea 
                name="observacoes" 
                value={formData.observacoes} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                rows="3"
                placeholder="Informações adicionais..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Informações de Egressa</label>
              <textarea 
                name="inform_egressa" 
                value={formData.inform_egressa} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                rows="3"
                placeholder="Situação após conclusão do curso..."
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          {alunoParaEditar ? (
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
            <button 
              type="submit" 
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded flex items-center gap-2"
            >
              <FaSave /> Cadastrar Aluno
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AlunoForm;