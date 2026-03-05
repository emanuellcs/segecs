-- 1. EXTENSÕES E LIMPEZA (OPCIONAL)
-- create extension if not exists "uuid-ossp";

-- 2. TABELAS AUXILIARES
create table cidades (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  uf char(2) not null default 'CE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table escolas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  inep text unique,
  cidade_id uuid references cidades(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table niveis (
  id uuid primary key default uuid_generate_v4(),
  descricao text not null unique, -- ex: 'Ensino Médio Integrado', 'Subsequente'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table cursos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  escola_id uuid references escolas(id) on delete cascade,
  nivel_id uuid references niveis(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PERFIS E RBAC
create type user_role as enum ('admin', 'coordenador', 'orientador', 'aluno', 'supervisor');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role user_role not null default 'aluno',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CADASTROS PRINCIPAIS
create table responsaveis (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text unique,
  telefone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table alunos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  nome text not null,
  matricula text unique,
  cpf text unique,
  data_nascimento date,
  curso_id uuid references cursos(id),
  responsavel_id uuid references responsaveis(id),
  status text check (status in ('pendente', 'estagiando', 'concluido', 'evadido')) default 'pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table empresas (
  id uuid primary key default uuid_generate_v4(),
  razao_social text not null,
  cnpj text unique not null,
  endereco text,
  cidade_id uuid references cidades(id),
  contato_nome text,
  contato_email text,
  contato_telefone text,
  convenio_numero text,
  convenio_validade date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table orientadores (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  nome text not null,
  cpf text unique,
  escola_id uuid references escolas(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table supervisores (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  nome text not null,
  empresa_id uuid references empresas(id) on delete cascade,
  cargo text,
  formacao text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. NÚCLEO DO ESTÁGIO
create table vagas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  curso_id uuid references cursos(id),
  titulo text not null,
  descricao text,
  quantidade int default 1,
  status text check (status in ('aberta', 'preenchida', 'cancelada')) default 'aberta',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table estagios (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references alunos(id) on delete cascade,
  vaga_id uuid references vagas(id),
  orientador_id uuid references orientadores(id),
  supervisor_id uuid references supervisores(id),
  data_inicio date not null,
  data_fim date not null,
  carga_horaria_total int default 400,
  carga_horaria_diaria int default 6,
  status text check (status in ('ativo', 'concluido', 'interrompido')) default 'ativo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ACOMPANHAMENTO
create table frequencias (
  id uuid primary key default uuid_generate_v4(),
  estagio_id uuid references estagios(id) on delete cascade,
  data date not null,
  horas_realizadas int not null,
  atividades text,
  validado_supervisor boolean default false,
  validado_orientador boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  estagio_id uuid references estagios(id) on delete cascade,
  tipo int check (tipo in (1, 2, 3)), -- 1ª, 2ª ou 3ª avaliação
  nota numeric(4,2),
  comentarios text,
  data_avaliacao date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table projetos_sociais (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references alunos(id) on delete cascade,
  titulo text not null,
  descricao text,
  horas_estimadas int default 30,
  data_execucao date,
  status text check (status in ('planejado', 'executado')) default 'planejado',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'), coalesce((new.raw_user_meta_data->>'role')::user_role, 'aluno'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table alunos enable row level security;
alter table empresas enable row level security;
alter table estagios enable row level security;
alter table frequencias enable row level security;

-- Exemplo de política: Usuário pode ler seu próprio perfil
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
-- Exemplo de política: Admins podem tudo
create policy "Admins have full access on profiles" on profiles for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
-- Coordenadores podem ver todos os alunos
create policy "Coordenadores can view all alunos" on alunos for select using (
  (select role from profiles where id = auth.uid()) in ('admin', 'coordenador')
);
-- Alunos podem ver seu próprio cadastro
create policy "Alunos can view own record" on alunos for select using (
  profile_id = auth.uid()
);
