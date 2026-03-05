import React, { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const alunoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  matricula: z.string().optional(),
  cpf: z.string().optional(),
  data_nascimento: z.string().optional(),
  curso_id: z.string().uuid('Selecione um curso válido'),
  responsavel_id: z.string().uuid('Selecione um responsável válido'),
  status: z.enum(['pendente', 'estagiando', 'concluido', 'evadido']).default('pendente'),
});

type AlunoFormValues = z.infer<typeof alunoSchema>;

interface Aluno {
  id: string;
  nome: string;
  matricula: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  curso_id: string;
  responsavel_id: string;
  status: string;
  created_at: string;
}

export default function AlunosPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { items: alunos, isLoading, create, update, remove } = useSupabaseCrud<Aluno>('alunos', ['alunos']);
  const { items: cursos } = useSupabaseCrud<any>('cursos', ['cursos']);
  const { items: responsaveis } = useSupabaseCrud<any>('responsaveis', ['responsaveis']);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema),
  });

  const onSubmit = async (data: AlunoFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingId(aluno.id);
    setValue('nome', aluno.nome);
    setValue('matricula', aluno.matricula || '');
    setValue('cpf', aluno.cpf || '');
    setValue('data_nascimento', aluno.data_nascimento || '');
    setValue('curso_id', aluno.curso_id);
    setValue('responsavel_id', aluno.responsavel_id);
    setValue('status', aluno.status as any);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" /> Alunos
          </h1>
          <p className="text-gray-500">Gerencie o cadastro de estudantes.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Aluno
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Aluno' : 'Novo Aluno'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                {...register('nome')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  errors.nome ? "border-red-500" : "border-gray-300"
                )}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
              <input {...register('matricula')} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input {...register('cpf')} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                {...register('curso_id')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none",
                  errors.curso_id ? "border-red-500" : "border-gray-300"
                )}
              >
                <option value="">Selecione o curso</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select
                {...register('responsavel_id')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none",
                  errors.responsavel_id ? "border-red-500" : "border-gray-300"
                )}
              >
                <option value="">Selecione o responsável</option>
                {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" {...register('data_nascimento')} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="pendente">Pendente</option>
                <option value="estagiando">Estagiando</option>
                <option value="concluido">Concluído</option>
                <option value="evadido">Evadido</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aluno</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Matrícula</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Curso</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Carregando alunos...</td></tr>
            ) : alunos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum aluno cadastrado.</td></tr>
            ) : (
              alunos.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">{aluno.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{aluno.matricula || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{cursos.find(c => c.id === aluno.curso_id)?.nome || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium uppercase",
                      aluno.status === 'estagiando' ? "bg-green-100 text-green-700" :
                      aluno.status === 'pendente' ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {aluno.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(aluno)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => confirm('Excluir?') && remove(aluno.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
