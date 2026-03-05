import { useState } from 'react';
import { ClipboardCheck, Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const estagioSchema = z.object({
  aluno_id: z.string().uuid('Selecione um aluno'),
  vaga_id: z.string().uuid('Selecione uma vaga'),
  orientador_id: z.string().uuid('Selecione um orientador'),
  supervisor_id: z.string().uuid('Selecione um supervisor'),
  data_inicio: z.string(),
  data_fim: z.string(),
  carga_horaria_total: z.number(),
  carga_horaria_diaria: z.number(),
  status: z.enum(['ativo', 'concluido', 'interrompido']),
});

type EstagioFormValues = z.infer<typeof estagioSchema>;

interface Estagio {
  id: string;
  aluno_id: string;
  vaga_id: string;
  orientador_id: string;
  supervisor_id: string;
  data_inicio: string;
  data_fim: string;
  carga_horaria_total: number;
  carga_horaria_diaria: number;
  status: string;
  created_at: string;
}

export default function EstagiosPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: estagios,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Estagio>('estagios', ['estagios']);
  const { items: alunos } = useSupabaseCrud<any>('alunos', ['alunos']);
  const { items: vagas } = useSupabaseCrud<any>('vagas', ['vagas']);
  const { items: orientadores } = useSupabaseCrud<any>('orientadores', ['orientadores']);
  const { items: supervisores } = useSupabaseCrud<any>('supervisores', ['supervisores']);
  const { items: empresas } = useSupabaseCrud<any>('empresas', ['empresas']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EstagioFormValues>({
    resolver: zodResolver(estagioSchema),
    defaultValues: { carga_horaria_total: 400, carga_horaria_diaria: 6, status: 'ativo' },
  });

  const onSubmit = async (data: EstagioFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (est: Estagio) => {
    setEditingId(est.id);
    setValue('aluno_id', est.aluno_id);
    setValue('vaga_id', est.vaga_id);
    setValue('orientador_id', est.orientador_id);
    setValue('supervisor_id', est.supervisor_id);
    setValue('data_inicio', est.data_inicio);
    setValue('data_fim', est.data_fim);
    setValue('carga_horaria_total', est.carga_horaria_total);
    setValue('carga_horaria_diaria', est.carga_horaria_diaria);
    setValue('status', est.status as any);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  const generateTCE = (_estagio: Estagio) => {
    toast.info('Geração de TCE iniciada... (Implementação do PDF na sequência)');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" /> Alocação de Estágios
          </h1>
          <p className="text-gray-500">Vincule alunos a vagas e gerencie os contratos (TCE).</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Estágio
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Estágio' : 'Novo Estágio'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <select
                {...register('aluno_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.aluno_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaga / Empresa</label>
              <select
                {...register('vaga_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.vaga_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione a vaga</option>
                {vagas.map((v) => {
                  const emp = empresas.find((e) => e.id === v.empresa_id);
                  return (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({emp?.razao_social})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientador</label>
              <select
                {...register('orientador_id')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione o orientador</option>
                {orientadores.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor de Campo
              </label>
              <select
                {...register('supervisor_id')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione o supervisor</option>
                {supervisores.map((s) => {
                  const emp = empresas.find((e) => e.id === s.empresa_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({emp?.razao_social})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                {...register('data_inicio')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                {...register('data_fim')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CH Total (Horas)
              </label>
              <input
                type="number"
                {...register('carga_horaria_total', { valueAsNumber: true })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CH Diária (Horas)
              </label>
              <input
                type="number"
                {...register('carga_horaria_diaria', { valueAsNumber: true })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="interrompido">Interrompido</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Empresa / Vaga</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Período</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Carregando estágios...
                </td>
              </tr>
            ) : estagios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum estágio ativo.
                </td>
              </tr>
            ) : (
              estagios.map((est) => {
                const aluno = alunos.find((a) => a.id === est.aluno_id);
                const vaga = vagas.find((v) => v.id === est.vaga_id);
                const emp = empresas.find((e) => e.id === vaga?.empresa_id);

                return (
                  <tr key={est.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700 font-medium">{aluno?.nome || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm">{vaga?.titulo}</div>
                      <div className="text-xs text-gray-400">{emp?.razao_social}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(est.data_inicio).toLocaleDateString('pt-BR')} a{' '}
                      {new Date(est.data_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                          est.status === 'ativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {est.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => generateTCE(est)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Gerar TCE/Documentos"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(est)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirm('Excluir?') && remove(est.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
