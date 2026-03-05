-- ==============================================================================
-- SEGECS SUPABASE SCHEMA
-- ==============================================================================

-- 1. LIMPEZA DA ESTRUTURA EXISTENTE (DROPS)
-- Usamos CASCADE para remover políticas dependentes automaticamente
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_my_role() cascade;

drop table if exists public.visitas cascade;
drop table if exists public.frequencias cascade;
drop table if exists public.avaliacoes cascade;
drop table if exists public.projetos_sociais cascade;
drop table if exists public.estagios cascade;
drop table if exists public.vagas cascade;
drop table if exists public.alunos cascade;
drop table if exists public.responsaveis cascade;
drop table if exists public.supervisores cascade;
drop table if exists public.orientadores cascade;
drop table if exists public.empresas cascade;
drop table if exists public.cursos cascade;
drop table if exists public.escolas cascade;
drop table if exists public.niveis cascade;
drop table if exists public.cidades cascade;
drop table if exists public.profiles cascade;

drop type if exists public.user_role cascade;

-- 2. EXTENSÕES
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 3. TIPOS CUSTOMIZADOS
create type public.user_role as enum ('admin', 'coordenador', 'orientador', 'aluno', 'supervisor');

-- 4. TABELAS DE APOIO
create table public.cidades (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  uf char(2) not null default 'CE',
  created_at timestamptz default now() not null
);

create table public.escolas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  inep text unique,
  cidade_id uuid references public.cidades(id),
  created_at timestamptz default now() not null
);

create table public.niveis (
  id uuid primary key default uuid_generate_v4(),
  descricao text not null unique,
  created_at timestamptz default now() not null
);

create table public.cursos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  escola_id uuid references public.escolas(id) on delete cascade,
  nivel_id uuid references public.niveis(id),
  carga_horaria_obrigatoria int not null default 400,
  created_at timestamptz default now() not null
);

-- 5. PERFIS (VINCULADO AO AUTH.USERS)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role public.user_role not null default 'aluno',
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 6. CADASTROS PRINCIPAIS
create table public.responsaveis (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text unique,
  telefone text,
  created_at timestamptz default now() not null
);

create table public.alunos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  nome text not null,
  matricula text unique,
  cpf text unique,
  data_nascimento date,
  curso_id uuid references public.cursos(id),
  responsavel_id uuid references public.responsaveis(id),
  status text check (status in ('pendente', 'estagiando', 'concluido', 'evadido')) default 'pendente',
  created_at timestamptz default now() not null
);

create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  razao_social text not null,
  cnpj text unique not null,
  endereco text,
  cidade_id uuid references public.cidades(id),
  contato_nome text,
  contato_email text,
  contato_telefone text,
  convenio_numero text,
  convenio_validade date,
  created_at timestamptz default now() not null
);

create table public.orientadores (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  nome text not null,
  cpf text unique,
  escola_id uuid references public.escolas(id),
  created_at timestamptz default now() not null
);

create table public.supervisores (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  nome text not null,
  empresa_id uuid references public.empresas(id) on delete cascade,
  cargo text,
  formacao text,
  created_at timestamptz default now() not null
);

-- 7. OPERACIONAL
create table public.vagas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade,
  curso_id uuid references public.cursos(id),
  titulo text not null,
  descricao text,
  quantidade int default 1,
  status text check (status in ('aberta', 'preenchida', 'cancelada')) default 'aberta',
  created_at timestamptz default now() not null
);

create table public.estagios (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references public.alunos(id) on delete cascade,
  vaga_id uuid references public.vagas(id),
  orientador_id uuid references public.orientadores(id),
  supervisor_id uuid references public.supervisores(id),
  data_inicio date not null,
  data_fim date not null,
  carga_horaria_total int default 400,
  carga_horaria_diaria int default 6,
  status text check (status in ('ativo', 'concluido', 'interrompido')) default 'ativo',
  created_at timestamptz default now() not null
);

create table public.frequencias (
  id uuid primary key default uuid_generate_v4(),
  estagio_id uuid references public.estagios(id) on delete cascade,
  data date not null,
  horas_realizadas int not null,
  atividades text,
  validado_supervisor boolean default false,
  validado_orientador boolean default false,
  created_at timestamptz default now() not null
);

create table public.avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  estagio_id uuid references public.estagios(id) on delete cascade,
  tipo int check (tipo in (1, 2, 3)),
  nota numeric(4,2),
  comentarios text,
  data_avaliacao date default current_date,
  created_at timestamptz default now() not null
);

create table public.visitas (
  id uuid primary key default uuid_generate_v4(),
  estagio_id uuid references public.estagios(id) on delete cascade,
  data_visita date not null default current_date,
  tipo text check (tipo in ('presencial', 'remota')) default 'presencial',
  resumo text not null,
  observacoes text,
  created_at timestamptz default now() not null
);

create table public.projetos_sociais (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references public.alunos(id) on delete cascade,
  titulo text not null,
  descricao text,
  horas_estimadas int default 30,
  data_execucao date,
  status text check (status in ('planejado', 'executado')) default 'planejado',
  created_at timestamptz default now() not null
);

-- 8. FUNÇÕES DE SUPORTE (SECURITY DEFINER PARA EVITAR RECURSÃO)
create or replace function public.get_my_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- 9. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'), 
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'aluno'::public.user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. SEGURANÇA (ROW LEVEL SECURITY)
alter table public.profiles enable row level security;
alter table public.alunos enable row level security;
alter table public.empresas enable row level security;
alter table public.estagios enable row level security;
alter table public.frequencias enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.visitas enable row level security;
alter table public.vagas enable row level security;
alter table public.projetos_sociais enable row level security;
alter table public.cidades enable row level security;
alter table public.escolas enable row level security;
alter table public.cursos enable row level security;
alter table public.niveis enable row level security;
alter table public.responsaveis enable row level security;
alter table public.orientadores enable row level security;
alter table public.supervisores enable row level security;

-- POLÍTICA GLOBAL PARA GESTORES (ADMIN E COORDENADOR)
do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'alunos', 'empresas', 'estagios', 'frequencias', 
    'avaliacoes', 'visitas', 'vagas', 'projetos_sociais', 'cidades', 
    'escolas', 'cursos', 'niveis', 'responsaveis', 'orientadores', 'supervisores'
  ];
begin
  foreach t in array tables loop
    execute format('create policy "Gestores total access on %I" on public.%I for all using ((select public.get_my_role()) in (''admin'', ''coordenador''))', t, t);
  end loop;
end $$;

-- POLÍTICAS ESPECÍFICAS PARA ALUNOS E OUTROS
create policy "Profiles: Ver próprio" on public.profiles for select using (auth.uid() = id);
create policy "Alunos: Ver próprio" on public.alunos for select using (auth.uid() = profile_id);
create policy "Estagios: Ver próprio" on public.estagios for select using (auth.uid() = aluno_id);
create policy "Visitas: Ver próprio" on public.visitas for select using (exists (select 1 from public.estagios where id = estagio_id and aluno_id = auth.uid()));
create policy "Frequencias: Ver próprio" on public.frequencias for select using (exists (select 1 from public.estagios where id = estagio_id and aluno_id = auth.uid()));

-- PERMISSÃO DE LEITURA PARA TABELAS AUXILIARES
create policy "Leitura tabelas base cidades" on public.cidades for select using (auth.role() = 'authenticated');
create policy "Leitura tabelas base escolas" on public.escolas for select using (auth.role() = 'authenticated');
create policy "Leitura tabelas base cursos" on public.cursos for select using (auth.role() = 'authenticated');
create policy "Leitura tabelas base niveis" on public.niveis for select using (auth.role() = 'authenticated');

-- 11. PERMISSÕES FINAIS
alter role authenticator set search_path to public, auth, extensions;
alter role postgres set search_path to public, auth, extensions;
