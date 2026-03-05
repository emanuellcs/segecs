import { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  User,
  BookOpen,
  Fingerprint,
  Calendar,
} from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { InputMask } from '@/components/ui/InputMask';
import { ListLayoutToggle } from '@/components/ui/ListLayoutToggle';
import { useListLayout } from '@/hooks/useListLayout';
import { toast } from 'sonner';

const alunoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  matricula: z.string().min(1, 'A matrícula é obrigatória'),
  cpf: z.string().min(14, 'CPF inválido'),
  data_nascimento: z.string().min(1, 'A data de nascimento é obrigatória'),
  curso_id: z.string().uuid('Selecione um curso válido'),
  responsavel_id: z.string().uuid('Selecione um responsável válido'),
  status: z.enum(['pendente', 'estagiando', 'concluido', 'evadido'], {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
});

type AlunoFormValues = z.infer<typeof alunoSchema>;

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  data_nascimento: string;
  curso_id: string;
  responsavel_id: string;
  status: 'pendente' | 'estagiando' | 'concluido' | 'evadido';
  created_at: string;
}

export default function AlunosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: alunos,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Aluno>('alunos', ['alunos']);

  const { items: cursos } = useSupabaseCrud<any>('cursos', ['cursos']);
  const { items: responsaveis } = useSupabaseCrud<any>('responsaveis', ['responsaveis']);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      status: 'pendente',
    },
  });

  const onSubmit = async (data: AlunoFormValues) => {
    try {
      if (selectedAluno) {
        await update({ id: selectedAluno.id, ...data });
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await create(data);
        toast.success('Aluno cadastrado com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar aluno');
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    reset({
      nome: aluno.nome,
      matricula: aluno.matricula,
      cpf: aluno.cpf,
      data_nascimento: aluno.data_nascimento,
      curso_id: aluno.curso_id,
      responsavel_id: aluno.responsavel_id,
      status: aluno.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAluno) return;
    try {
      await remove(selectedAluno.id);
      toast.success('Aluno removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedAluno(null);
    } catch (error) {
      toast.error('Erro ao remover aluno');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAluno(null);
    reset();
  };

  const filteredAlunos = alunos.filter(
    (aluno) =>
      (aluno.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (aluno.matricula || '').includes(searchTerm) ||
      (aluno.cpf || '').includes(searchTerm)
  );

  const { listLayout } = useListLayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} /> Alunos
          </h1>
          <p className="text-gray-500 font-medium">Gestão centralizada de estudantes</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Aluno
        </button>
      </div>

      {/* Busca e Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <ListLayoutToggle />
      </div>

      {/* Listagem Responsiva (Cards) */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          listLayout === 'table' ? 'lg:hidden' : 'lg:grid-cols-2 xl:grid-cols-3'
        )}
      >
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold col-span-full">
            Carregando alunos...
          </div>
        ) : filteredAlunos.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum aluno encontrado.
          </div>
        ) : (
          filteredAlunos.map((aluno) => (
            <div
              key={aluno.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{aluno.nome}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Matrícula: {aluno.matricula}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                    aluno.status === 'estagiando'
                      ? 'bg-green-100 text-green-700'
                      : aluno.status === 'pendente'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {aluno.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <BookOpen size={14} className="text-blue-500" />
                  <span className="truncate">
                    {cursos.find((c: any) => c.id === aluno.curso_id)?.nome || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Fingerprint size={14} className="text-blue-500" />
                  <span>{aluno.cpf}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(aluno)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(aluno)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabela Desktop */}
      {listLayout === 'table' && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Aluno
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Matrícula
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Curso
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse"
                  >
                    Carregando lista de alunos...
                  </td>
                </tr>
              ) : filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Nenhum aluno cadastrado.
                  </td>
                </tr>
              ) : (
                filteredAlunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {aluno.nome.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">{aluno.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{aluno.matricula}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {cursos.find((c: any) => c.id === aluno.curso_id)?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                          aluno.status === 'estagiando'
                            ? 'bg-green-100 text-green-700'
                            : aluno.status === 'pendente'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {aluno.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(aluno)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(aluno)}
                          className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedAluno ? 'Editar Aluno' : 'Novo Cadastro de Aluno'}
        description="Preencha todos os dados obrigatórios para manter o registro atualizado."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('nome')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.nome
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                  placeholder="Ex: João Silva Sauro"
                />
              </div>
              {errors.nome && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Matrícula</label>
              <input
                {...register('matricula')}
                className={cn(
                  'w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                  errors.matricula
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                )}
                placeholder="000000"
              />
              {errors.matricula && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.matricula.message}
                </p>
              )}
            </div>

            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="cpf"
                  label="CPF"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.cpf?.message}
                  placeholder="000.000.000-00"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Curso</label>
              <select
                {...register('curso_id')}
                className={cn(
                  'w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white',
                  errors.curso_id
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                )}
              >
                <option value="">Selecione o curso...</option>
                {cursos.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.curso_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.curso_id.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Responsável Legal</label>
              <select
                {...register('responsavel_id')}
                className={cn(
                  'w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white',
                  errors.responsavel_id
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                )}
              >
                <option value="">Selecione o responsável...</option>
                {responsaveis.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
              {errors.responsavel_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.responsavel_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Nascimento</label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register('data_nascimento')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.data_nascimento
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                />
              </div>
              {errors.data_nascimento && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.data_nascimento.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Status Acadêmico</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="pendente">🟡 PENDENTE</option>
                <option value="estagiando">🟢 ESTAGIANDO</option>
                <option value="concluido">🔵 CONCLUÍDO</option>
                <option value="evadido">🔴 EVADIDO</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Salvando...'
                : selectedAluno
                  ? 'Salvar Alterações'
                  : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedAluno?.nome}
      />
    </div>
  );
}
