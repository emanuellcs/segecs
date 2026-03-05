-- ==============================================================================
-- SEGECS SEED SCRIPT
-- ==============================================================================

-- 1. CONFIGURAÇÕES DE AMBIENTE
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE postgres SET search_path TO public, auth, extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AJUSTE DO TRIGGER DE PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'), 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'aluno'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. LIMPEZA TOTAL (RECOMEÇO LIMPO)
TRUNCATE public.frequencias, public.avaliacoes, public.projetos_sociais, 
         public.estagios, public.vagas, public.alunos, public.responsaveis, 
         public.supervisores, public.orientadores, public.empresas, 
         public.cursos, public.escolas, public.niveis, public.cidades, 
         public.profiles CASCADE;

DELETE FROM auth.users;
DELETE FROM auth.identities;

-- 4. CADASTROS BASE
INSERT INTO public.cidades (nome, uf) VALUES 
('Crateús', 'CE'), ('Fortaleza', 'CE'), ('Sobral', 'CE'), ('Quixadá', 'CE');

INSERT INTO public.niveis (descricao) VALUES 
('Ensino Médio Integrado'), ('Subsequente');

INSERT INTO public.escolas (nome, inep, cidade_id) VALUES 
('EEEP Manoel Mano', '23001234', (SELECT id FROM public.cidades WHERE nome = 'Crateús' LIMIT 1)),
('EEEP Paulo VI', '23005678', (SELECT id FROM public.cidades WHERE nome = 'Fortaleza' LIMIT 1));

INSERT INTO public.cursos (nome, escola_id, nivel_id) VALUES 
('Técnico em Informática', (SELECT id FROM public.escolas WHERE nome = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1)),
('Técnico em Redes', (SELECT id FROM public.escolas WHERE nome = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1));

-- 5. CRIAÇÃO MASSIVA DE USUÁRIOS (45 ALUNOS + 3 ADMINS)
DO $$
DECLARE
  hashed_pw TEXT := extensions.crypt('12345678', extensions.gen_salt('bf'));
  instance_id_val UUID := '00000000-0000-0000-0000-000000000000';
  i INT;
  curr_id UUID;
  curr_email TEXT;
  curr_name TEXT;
  curr_role TEXT;
  course_id UUID := (SELECT id FROM public.cursos WHERE nome = 'Técnico em Informática' LIMIT 1);
  resp_id UUID;
BEGIN
  FOR i IN 1..48 LOOP
    
    IF i = 1 THEN
      curr_email := 'coord@eeep.com.br'; curr_name := 'Coordenação Geral'; curr_role := 'admin'; curr_id := '00000000-0000-0000-0000-000000000001';
    ELSIF i = 2 THEN
      curr_email := 'prof@eeep.com.br'; curr_name := 'Professor Alberto'; curr_role := 'orientador'; curr_id := '00000000-0000-0000-0000-000000000002';
    ELSIF i = 3 THEN
      curr_email := 'supervisor@tech.com.br'; curr_name := 'Supervisor Marcos'; curr_role := 'supervisor'; curr_id := '00000000-0000-0000-0000-000000000004';
    ELSE
      curr_email := 'aluno' || (i-3) || '@eeep.com.br'; curr_name := 'Aluno ' || (i-3); curr_role := 'aluno'; curr_id := extensions.uuid_generate_v4();
    END IF;

    -- A. Inserir no AUTH.USERS (Lista completa de 19 colunas para evitar Erro 500)
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, aud, role, 
      created_at, updated_at, 
      confirmation_token, recovery_token, email_change, email_change_token_new, 
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    )
    VALUES (
      curr_id, instance_id_val, curr_email, hashed_pw, now(), 
      '{"provider":"email","providers":["email"]}', format('{"full_name":"%s", "role":"%s"}', curr_name, curr_role)::jsonb, 
      'authenticated', 'authenticated', 
      now(), now(),
      '', '', '', '', '', '', '', '' -- 8 strings vazias para os tokens
    );

    -- B. Inserir no AUTH.IDENTITIES (Obrigatório para permitir Login)
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (extensions.uuid_generate_v4(), curr_id, format('{"sub":"%s","email":"%s"}', curr_id, curr_email)::jsonb, 'email', curr_email, now(), now(), now());

    -- C. Registro na tabela ALUNOS
    IF curr_role = 'aluno' THEN
      INSERT INTO public.responsaveis (nome, cpf) 
      VALUES ('Responsável de ' || curr_name, '000.000.000-' || LPAD(i::text, 2, '0')) 
      RETURNING id INTO resp_id;

      INSERT INTO public.alunos (profile_id, nome, matricula, curso_id, responsavel_id, status)
      VALUES (curr_id, curr_name, '2024' || LPAD((i-3)::text, 3, '0'), course_id, resp_id, 
        CASE WHEN (i-3) <= 30 THEN 'estagiando' WHEN (i-3) <= 40 THEN 'pendente' ELSE 'concluido' END);
    END IF;
  END LOOP;
END $$;

-- 6. DADOS COMPLEMENTARES
INSERT INTO public.empresas (razao_social, cnpj, endereco, cidade_id, contato_nome, convenio_numero, convenio_validade) VALUES 
('Crateús Tech Solutions', '11.111.111/0001-01', 'Rua da Inovação, 50', (SELECT id FROM public.cidades WHERE nome = 'Crateús' LIMIT 1), 'Carla Mendes', 'CONV-2024-01', '2026-12-31');

INSERT INTO public.orientadores (profile_id, nome, cpf, escola_id) 
VALUES ('00000000-0000-0000-0000-000000000002', 'Prof. Alberto', '222.333.444-55', (SELECT id FROM public.escolas LIMIT 1));

INSERT INTO public.supervisores (profile_id, nome, empresa_id, cargo)
VALUES ('00000000-0000-0000-0000-000000000004', 'Eng. Marcos', (SELECT id FROM public.empresas LIMIT 1), 'Gerente');

INSERT INTO public.vagas (empresa_id, curso_id, titulo, quantidade, status) VALUES 
((SELECT id FROM public.empresas LIMIT 1), (SELECT id FROM public.cursos LIMIT 1), 'Suporte e Inovação', 30, 'aberta');

INSERT INTO public.estagios (aluno_id, vaga_id, orientador_id, supervisor_id, data_inicio, data_fim, status)
SELECT a.id, (SELECT id FROM public.vagas LIMIT 1), (SELECT id FROM public.orientadores LIMIT 1), (SELECT id FROM public.supervisores LIMIT 1), current_date - interval '2 months', current_date + interval '4 months', 'ativo'
FROM public.alunos a WHERE a.status = 'estagiando';

INSERT INTO public.frequencias (estagio_id, data, horas_realizadas, atividades, validado_supervisor, validado_orientador)
SELECT e.id, current_date - (n || ' days')::interval, 6, 'Desenvolvimento e manutenção técnica.', true, true
FROM public.estagios e CROSS JOIN generate_series(1, 40) as n;

NOTIFY pgrst, 'reload schema';
