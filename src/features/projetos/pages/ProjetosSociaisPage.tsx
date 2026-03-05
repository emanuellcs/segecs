import { useState } from 'react';
import { Heart, Plus, Edit2, Trash2, Search, User, Calendar, Clock, Activity } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { ListLayoutToggle } from '@/components/ui/ListLayoutToggle';
import { useListLayout } from '@/hooks/useListLayout';
import { toast } from 'sonner';

const projetoSchema = z.object({
  aluno_id: z.string().uuid('Selecione um aluno válido'),
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  descricao: z.string().optional().or(z.literal('')),
  horas_estimadas: z.number().min(1, 'Mínimo 1 hora'),
  data_execucao: z.string().optional().or(z.literal('')),
  status: z.enum(['planejado', 'executado'], {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
});

type ProjetoFormValues = z.infer<typeof projetoSchema>;

interface ProjetoSocial {
  id: string;
  aluno_id: string;
  titulo: string;
  descricao?: string | null;
  horas_estimadas: number;
  data_execucao?: string | null;
  status: 'planejado' | 'executado';
  created_at: string;
}

export default function ProjetosSociaisPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState<ProjetoSocial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: projetos,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<ProjetoSocial>('projetos_sociais', ['projetos_sociais']);
  
  const { items: alunos } = useSupabaseCrud<any>('alunos', ['alunos']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjetoFormValues>({
    resolver: zodResolver(projetoSchema),
    defaultValues: { 
      horas_estimadas: 30, 
      status: 'planejado' 
    },
  });

  const onSubmit = async (data: ProjetoFormValues) => {
    try {
      if (selectedProj) {
        await update({ id: selectedProj.id, ...data });
        toast.success('Projeto social atualizado!');
      } else {
        await create(data);
        toast.success('Projeto social cadastrado!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar projeto');
    }
  };

  const handleEdit = (proj: ProjetoSocial) => {
    setSelectedProj(proj);
    reset({
      aluno_id: proj.aluno_id,
      titulo: proj.titulo,
      descricao: proj.descricao || '',
      horas_estimadas: proj.horas_estimadas,
      data_execucao: proj.data_execucao || '',
      status: proj.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (proj: ProjetoSocial) => {
    setSelectedProj(proj);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProj) return;
    try {
      await remove(selectedProj.id);
      toast.success('Projeto removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedProj(null);
    } catch (error) {
      toast.error('Erro ao remover projeto');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProj(null);
    reset();
  };

  const filteredProjetos = projetos.filter(proj => {
    const alunoNome = alunos.find(a => a.id === proj.aluno_id)?.nome || '';
    return (
      (proj.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (alunoNome?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const { listLayout } = useListLayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Heart className="text-red-500" size={28} /> Projetos Sociais
          </h1>
          <p className="text-gray-500 font-medium">Gestão de contrapartidas obrigatórias</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      {/* Busca e Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por título ou nome do aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <ListLayoutToggle />
      </div>

      {/* Listagem Responsiva (Cards) */}
      <div className={cn(
        "grid grid-cols-1 gap-4",
        listLayout === 'table' ? "lg:hidden" : "lg:grid-cols-2 xl:grid-cols-3"
      )}>
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold col-span-full">
            Carregando projetos...
          </div>
        ) : filteredProjetos.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum projeto encontrado.
          </div>
        ) : (
          filteredProjetos.map((proj) => {
            const aluno = alunos.find(a => a.id === proj.aluno_id);

            return (
              <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{proj.titulo}</h3>
                      <p className="text-xs text-gray-500 font-medium">{aluno?.nome}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                    proj.status === 'executado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {proj.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="truncate">{proj.data_execucao ? new Date(proj.data_execucao).toLocaleDateString('pt-BR') : 'Não executado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Clock size={14} className="text-blue-500" />
                    <span>{proj.horas_estimadas}h estimadas</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(proj)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela Desktop */}
      {listLayout === 'table' && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Título / Aluno</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Horas</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Data Execução</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse">
                    Carregando lista de projetos...
                  </td>
                </tr>
              ) : filteredProjetos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Nenhum projeto registrado.
                  </td>
                </tr>
              ) : (
                filteredProjetos.map((proj) => {
                  const aluno = alunos.find(a => a.id === proj.aluno_id);

                  return (
                    <tr key={proj.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{proj.titulo}</span>
                          <span className="text-xs text-gray-500 font-medium">{aluno?.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-bold">
                        {proj.horas_estimadas}h
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {proj.data_execucao ? new Date(proj.data_execucao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                          proj.status === 'executado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(proj)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(proj)}
                            className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedProj ? 'Editar Projeto' : 'Novo Projeto Social'}
        description="Registre as informações do projeto de contrapartida social."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Título do Projeto</label>
              <div className="relative mt-1">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('titulo')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.titulo ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Ex: Doação de Alimentos"
                />
              </div>
              {errors.titulo && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.titulo.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Aluno Responsável</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  {...register('aluno_id')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.aluno_id ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                >
                  <option value="">Selecione o aluno...</option>
                  {alunos.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
              {errors.aluno_id && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.aluno_id.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Horas Estimadas</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  {...register('horas_estimadas', { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.horas_estimadas ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                />
              </div>
              {errors.horas_estimadas && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.horas_estimadas.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Data de Execução</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  {...register('data_execucao')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="planejado">🟡 PLANEJADO</option>
                <option value="executado">🟢 EXECUTADO</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
              <div className="relative mt-1">
                <Activity className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  {...register('descricao')}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Detalhes sobre as atividades sociais..."
                />
              </div>
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
              {isSubmitting ? 'Salvando...' : selectedProj ? 'Salvar Alterações' : 'Confirmar Projeto'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedProj?.titulo}
      />
    </div>
  );
}
