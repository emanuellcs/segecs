import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function AlunoForm({ onSuccess, alunoParaEditar, onCancel }) {
  const [formData, setFormData] = useState({
    matricula: '', nome: '', rg: '', cpf: '', nasc: '',
    telefone: '', email: '', id_cidade: '', bairro: '',
    zona: '', id_curso: '', turma: '', observacoes: '',
    inform_egressa: '', facebook: '', linkedin: '', github: ''
  });
  const [cursos, setCursos] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCursos, resCidades] = await Promise.all([
          api.get('/cursos'),
          api.get('/cidades')
        ]);
        setCursos(resCursos.data);
        setCidades(resCidades.data);
      } catch (err) {
        console.error("Erro ao carregar dados auxiliares", err);
      }
    };
    fetchData();

    if (alunoParaEditar) {
      // Formata a data para o input date (YYYY-MM-DD)
      const formattedDate = alunoParaEditar.nasc ? new Date(alunoParaEditar.nasc).toISOString().split('T')[0] : '';
      setFormData({ ...alunoParaEditar, nasc: formattedDate });
    }
  }, [alunoParaEditar]);

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
      const errors = err.response?.data?.errors;
      const msg = err.response?.data?.message || 'Erro ao processar solicitação.';
      
      Swal.fire({
        icon: 'error',
        title: 'Erro de Validação',
        html: errors ? `<ul class="text-left text-sm">${errors.map(e => `<li>• ${e.msg}</li>`).join('')}</ul>` : msg
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", required = false }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label} {required && "*"}</label>
      <input
        type={type}
        value={formData[name] || ''}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
        required={required}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField label="Matrícula" name="matricula" required />
        <InputField label="Nome Completo" name="nome" required />
        <InputField label="CPF" name="cpf" required />
        <InputField label="RG" name="rg" />
        <InputField label="Data de Nascimento" name="nasc" type="date" required />
        <InputField label="Telefone" name="telefone" />
        <InputField label="Email" name="email" type="email" />
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade *</label>
          <select
            value={formData.id_cidade}
            onChange={(e) => setFormData({ ...formData, id_cidade: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">Selecione...</option>
            {cidades.map(c => <option key={c.id_cidade} value={c.id_cidade}>{c.cidade} - {c.uf}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Curso *</label>
          <select
            value={formData.id_curso}
            onChange={(e) => setFormData({ ...formData, id_curso: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">Selecione...</option>
            {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nome_curso}</option>)}
          </select>
        </div>

        <InputField label="Turma" name="turma" />
      </div>

      <div className="flex flex-wrap gap-4 justify-end pt-6 border-t border-gray-100">
        <Button onClick={onCancel} variant="secondary" icon={FaTimes}>Cancelar</Button>
        <Button type="submit" disabled={loading} icon={FaSave}>{loading ? 'Salvando...' : 'Salvar Aluno'}</Button>
      </div>
    </form>
  );
}

export default AlunoForm;
