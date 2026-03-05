import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Toast } from '@/utils/swalHelpers';
import Swal from 'sweetalert2';
import api from '@/services/api';
import Button from '@/components/common/Button';

function UsuariosForm({ onSuccess, usuarioParaEditar, onCancel, niveis }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    id_nivel: '',
    ativo: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuarioParaEditar) {
      setFormData({
        nome_completo: usuarioParaEditar.nome_completo || '',
        email: usuarioParaEditar.email || '',
        senha: '',
        id_nivel: usuarioParaEditar.id_nivel || '',
        ativo: usuarioParaEditar.ativo !== undefined ? usuarioParaEditar.ativo : true,
      });
    } else {
      setFormData({ nome_completo: '', email: '', senha: '', id_nivel: '', ativo: true });
    }
  }, [usuarioParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (usuarioParaEditar) {
        await api.put(`/usuarios/${usuarioParaEditar.id_usuario}`, formData);
        Toast.fire({ icon: 'success', title: 'Usuário atualizado com sucesso!' });
      } else {
        await api.post('/usuarios', formData);
        Toast.fire({ icon: 'success', title: 'Usuário cadastrado com sucesso!' });
      }
      onSuccess();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = err.response?.data?.message || 'Erro ao processar solicitação.';

      Swal.fire({
        icon: 'error',
        title: 'Erro de Validação',
        html: errors
          ? `<ul class="text-left text-sm">${errors.map((e) => `<li>• ${e.msg}</li>`).join('')}</ul>`
          : msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', required = false, placeholder = '' }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={formData[name] || ''}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Nome Completo"
          name="nome_completo"
          required
          placeholder="Ex: João da Silva"
        />
        <InputField
          label="Email (Login)"
          name="email"
          type="email"
          required
          placeholder="exemplo@segecs.com"
        />
        <InputField
          label={usuarioParaEditar ? 'Nova Senha (opcional)' : 'Senha'}
          name="senha"
          type="password"
          required={!usuarioParaEditar}
          placeholder="••••••••"
        />

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nível de Acesso *
          </label>
          <select
            value={formData.id_nivel}
            onChange={(e) => setFormData({ ...formData, id_nivel: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
            required
          >
            <option value="">Selecione o perfil...</option>
            {niveis.map((n) => (
              <option key={n.id_nivel} value={n.id_nivel}>
                {n.nivel}
              </option>
            ))}
          </select>
        </div>

        {usuarioParaEditar && (
          <div className="flex items-center pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Usuário Ativo
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-end pt-6 border-t border-gray-50">
        <Button onClick={onCancel} variant="secondary" icon={FaTimes}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} icon={usuarioParaEditar ? FaSave : FaPlus}>
          {loading ? 'Salvando...' : usuarioParaEditar ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </Button>
      </div>
    </form>
  );
}

export default UsuariosForm;
