-- ==============================================================================
-- SEGECS SUPABASE SCHEMA
-- ==============================================================================

-- 1. STRUCTURE CLEANUP (DROPS)
-- Using CASCADE to automatically remove dependent policies
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_my_role() cascade;

drop table if exists public.visits cascade;
drop table if exists public.frequencies cascade;
drop table if exists public.evaluations cascade;
drop table if exists public.social_projects cascade;
drop table if exists public.internships cascade;
drop table if exists public.vacancies cascade;
drop table if exists public.students cascade;
drop table if exists public.guardians cascade;
drop table if exists public.supervisors cascade;
drop table if exists public.advisors cascade;
drop table if exists public.companies cascade;
drop table if exists public.courses cascade;
drop table if exists public.schools cascade;
drop table if exists public.levels cascade;
drop table if exists public.cities cascade;
drop table if exists public.profiles cascade;

drop type if exists public.user_role cascade;

-- 2. EXTENSIONS
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 3. CUSTOM TYPES
create type public.user_role as enum ('admin', 'coordinator', 'advisor', 'student', 'supervisor');

-- 4. SUPPORT TABLES
create table public.cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  state char(2) not null default 'CE',
  created_at timestamptz default now() not null
);

create table public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  inep text unique,
  city_id uuid references public.cities(id),
  created_at timestamptz default now() not null
);

create table public.levels (
  id uuid primary key default uuid_generate_v4(),
  description text not null unique,
  created_at timestamptz default now() not null
);

create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  school_id uuid references public.schools(id) on delete cascade,
  level_id uuid references public.levels(id),
  mandatory_workload int not null default 400,
  created_at timestamptz default now() not null
);

-- 5. PROFILES (LINKED TO AUTH.USERS)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 6. MAIN REGISTRATIONS
create table public.guardians (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cpf text unique,
  phone text,
  created_at timestamptz default now() not null
);

create table public.students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  registration text unique,
  cpf text unique,
  birth_date date,
  course_id uuid references public.courses(id),
  guardian_id uuid references public.guardians(id),
  status text check (status in ('pending', 'interning', 'completed', 'dropped_out')) default 'pending',
  created_at timestamptz default now() not null
);

create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  cnpj text unique not null,
  address text,
  city_id uuid references public.cities(id),
  contact_name text,
  contact_email text,
  contact_phone text,
  agreement_number text,
  agreement_validity date,
  created_at timestamptz default now() not null
);

create table public.advisors (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  cpf text unique,
  school_id uuid references public.schools(id),
  created_at timestamptz default now() not null
);

create table public.supervisors (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  company_id uuid references public.companies(id) on delete cascade,
  position text,
  education text,
  created_at timestamptz default now() not null
);

-- 7. OPERATIONAL
create table public.vacancies (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  course_id uuid references public.courses(id),
  title text not null,
  description text,
  quantity int default 1,
  status text check (status in ('open', 'filled', 'cancelled')) default 'open',
  created_at timestamptz default now() not null
);

create table public.internships (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  vacancy_id uuid references public.vacancies(id),
  advisor_id uuid references public.advisors(id),
  supervisor_id uuid references public.supervisors(id),
  start_date date not null,
  end_date date not null,
  total_workload int default 400,
  daily_workload int default 6,
  status text check (status in ('active', 'completed', 'interrupted')) default 'active',
  created_at timestamptz default now() not null
);

create table public.frequencies (
  id uuid primary key default uuid_generate_v4(),
  internship_id uuid references public.internships(id) on delete cascade,
  date date not null,
  performed_hours int not null,
  activities text,
  validated_by_supervisor boolean default false,
  validated_by_advisor boolean default false,
  created_at timestamptz default now() not null
);

create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  internship_id uuid references public.internships(id) on delete cascade,
  type int check (type in (1, 2, 3)),
  grade numeric(4,2),
  comments text,
  evaluation_date date default current_date,
  created_at timestamptz default now() not null
);

create table public.visits (
  id uuid primary key default uuid_generate_v4(),
  internship_id uuid references public.internships(id) on delete cascade,
  visit_date date not null default current_date,
  type text check (type in ('in_person', 'remote')) default 'in_person',
  summary text not null,
  observations text,
  created_at timestamptz default now() not null
);

create table public.social_projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  description text,
  estimated_hours int default 30,
  execution_date date,
  status text check (status in ('planned', 'executed')) default 'planned',
  created_at timestamptz default now() not null
);

-- 8. SUPPORT FUNCTIONS (SECURITY DEFINER TO AVOID RECURSION)
create or replace function public.get_my_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- 9. TRIGGER FOR AUTOMATIC PROFILE CREATION
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User'), 
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. SECURITY (ROW LEVEL SECURITY)
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.companies enable row level security;
alter table public.internships enable row level security;
alter table public.frequencies enable row level security;
alter table public.evaluations enable row level security;
alter table public.visits enable row level security;
alter table public.vacancies enable row level security;
alter table public.social_projects enable row level security;
alter table public.cities enable row level security;
alter table public.schools enable row level security;
alter table public.courses enable row level security;
alter table public.levels enable row level security;
alter table public.guardians enable row level security;
alter table public.advisors enable row level security;
alter table public.supervisors enable row level security;

-- GLOBAL POLICY FOR MANAGERS (ADMIN AND COORDINATOR)
do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'students', 'companies', 'internships', 'frequencies', 
    'evaluations', 'visits', 'vacancies', 'social_projects', 'cities', 
    'schools', 'courses', 'levels', 'guardians', 'advisors', 'supervisors'
  ];
begin
  foreach t in array tables loop
    execute format('create policy "Managers total access on %I" on public.%I for all using ((select public.get_my_role()) in (''admin'', ''coordinator''))', t, t);
  end loop;
end $$;

-- SPECIFIC POLICIES FOR STUDENTS AND OTHERS
create policy "Profiles: View own" on public.profiles for select using (auth.uid() = id);
create policy "Students: View own" on public.students for select using (auth.uid() = profile_id);
create policy "Internships: View own" on public.internships for select using (auth.uid() = student_id);
create policy "Visits: View own" on public.visits for select using (exists (select 1 from public.internships where id = internship_id and student_id = auth.uid()));
create policy "Frequencies: View own" on public.frequencies for select using (exists (select 1 from public.internships where id = internship_id and student_id = auth.uid()));

-- READ PERMISSION FOR BASE TABLES
create policy "Read base tables cities" on public.cities for select using (auth.role() = 'authenticated');
create policy "Read base tables schools" on public.schools for select using (auth.role() = 'authenticated');
create policy "Read base tables courses" on public.courses for select using (auth.role() = 'authenticated');
create policy "Read base tables levels" on public.levels for select using (auth.role() = 'authenticated');

-- 11. FINAL PERMISSIONS
alter role authenticator set search_path to public, auth, extensions;
alter role postgres set search_path to public, auth, extensions;
