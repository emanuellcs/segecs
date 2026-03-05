import { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, School, GraduationCap } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { toast } from 'sonner';

const cursoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  escola_id: z.string().uuid('Selecione uma escola válida'),
  nivel_id: z.string().uuid('Selecione um nível válido'),
});

type CursoFormValues = z.infer<typeof cursoSchema>;

interface Curso {
  id: string;
  nome: string;
  escola_id: string;
  nivel_id: string;
  created_at: string;
}

export default function CursosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: cursos,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Curso>('cursos', ['cursos']);
  
  const { items: escolas } = useSupabaseCrud<any>('escolas', ['escolas']);
  const { items: niveis } = useSupabaseCrud<any>('niveis', ['niveis']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CursoFormValues>({
    resolver: zodResolver(cursoSchema),
  });

  const onSubmit = async (data: CursoFormValues) => {
    try {
      if (selectedCurso) {
        await update({ id: selectedCurso.id, ...data });
        toast.success('Curso atualizado com sucesso!');
      } else {
        await create(data);
        toast.success('Curso cadastrado com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar curso');
    }
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    reset({
      nome: curso.nome,
      escola_id: curso.escola_id,
      nivel_id: curso.nivel_id,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCurso) return;
    try {
      await remove(selectedCurso.id);
      toast.success('Curso removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedCurso(null);
    } catch (error) {
      toast.error('Erro ao remover curso');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCurso(null);
    reset();
  };

  const filteredCursos = cursos.filter(curso => 
    (curso.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={28} /> Cursos
          </h1>
          <p className="text-gray-500 font-medium">Gestão de cursos e formações</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Curso
        </button>
      </div>

      {/* Busca */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome do curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Listagem Responsiva */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold">
            Carregando cursos...
          </div>
        ) : filteredCursos.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100">
            Nenhum curso encontrado.
          </div>
        ) : (
          filteredCursos.map((curso) => (
            <div key={curso.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{curso.nome}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {niveis.find((n: any) => n.id === curso.nivel_id)?.descricao || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <School size={14} className="text-blue-500" />
                <span className="truncate">{escolas.find((e: any) => e.id === curso.escola_id)?.nome || 'N/A'}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(curso)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(curso)}
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
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Curso</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Escola</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Nível</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse">
                  Carregando lista de cursos...
                </td>
              </tr>
            ) : filteredCursos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                  Nenhum curso cadastrado.
                </td>
              </tr>
            ) : (
              filteredCursos.map((curso) => (
                <tr key={curso.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                        {curso.nome.substring(0, 2)}
                      </div>
                      <span className="text-gray-900 font-bold">{curso.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {escolas.find((e: any) => e.id === curso.escola_id)?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {niveis.find((n: any) => n.id === curso.nivel_id)?.descricao || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(curso)}
                        className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(curso)}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedCurso ? 'Editar Curso' : 'Novo Cadastro de Curso'}
        description="Preencha os dados da formação técnica ou profissional."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Nome do Curso</label>
              <div className="relative mt-1">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('nome')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.nome ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Ex: Técnico em Informática"
                />
              </div>
              {errors.nome && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Escola</label>
              <div className="relative mt-1">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  {...register('escola_id')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.escola_id ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                >
                  <option value="">Selecione a escola...</option>
                  {escolas.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
              {errors.escola_id && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.escola_id.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Nível de Ensino</label>
              <div className="relative mt-1">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  {...register('nivel_id')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.nivel_id ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                >
                  <option value="">Selecione o nível...</option>
                  {niveis.map((n: any) => (
                    <option key={n.id} value={n.id}>{n.descricao}</option>
                  ))}
                </select>
              </div>
              {errors.nivel_id && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.nivel_id.message}</p>}
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
              {isSubmitting ? 'Salvando...' : selectedCurso ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedCurso?.nome}
      />
    </div>
  );
}
