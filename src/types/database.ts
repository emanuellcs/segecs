export interface Aluno {
  id: string;
  nome: string;
  matricula?: string | null;
  cpf?: string | null;
  data_nascimento?: string | null;
  curso_id: string;
  responsavel_id: string;
  status: "pendente" | "estagiando" | "concluido" | "evadido";
  created_at: string;
}

export interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
  endereco?: string | null;
  cidade_id: string;
  contato_nome?: string | null;
  contato_email?: string | null;
  contato_telefone?: string | null;
  convenio_numero?: string | null;
  convenio_validade?: string | null;
  created_at: string;
}

export interface Escola {
  id: string;
  nome: string;
  inep?: string | null;
  cidade_id: string;
  created_at: string;
}

export interface Estagio {
  id: string;
  aluno_id: string;
  vaga_id: string;
  orientador_id: string;
  supervisor_id: string;
  data_inicio: string;
  data_fim: string;
  carga_horaria_total: number;
  carga_horaria_diaria: number;
  status: "ativo" | "concluido" | "interrompido";
  created_at: string;
}

export interface Supervisor {
  id: string;
  nome: string;
  empresa_id: string;
  cargo?: string | null;
  formacao?: string | null;
  created_at: string;
}

export interface Orientador {
  id: string;
  nome: string;
  cpf?: string | null;
  escola_id: string;
  created_at: string;
}

export interface Frequencia {
  id: string;
  estagio_id: string;
  data: string;
  horas_realizadas: number;
  atividades: string;
  validado_supervisor: boolean;
  validado_orientador: boolean;
  created_at: string;
}

export interface Avaliacao {
  id: string;
  estagio_id: string;
  tipo: number;
  nota: number;
  comentarios?: string | null;
  data_avaliacao: string;
  created_at: string;
}

export interface ProjetoSocial {
  id: string;
  aluno_id: string;
  titulo: string;
  descricao?: string | null;
  horas_estimadas: number;
  data_execucao?: string | null;
  status: "planejado" | "executado";
  created_at: string;
}
