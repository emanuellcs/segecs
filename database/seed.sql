-- ==============================================================================
-- SEGECS SEED SCRIPT (VERSÃO COMPLETA)
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
TRUNCATE public.visitas, public.frequencias, public.avaliacoes, public.projetos_sociais, 
         public.estagios, public.vagas, public.alunos, public.responsaveis, 
         public.supervisores, public.orientadores, public.empresas, 
         public.cursos, public.escolas, public.niveis, public.cidades, 
         public.profiles CASCADE;

DELETE FROM auth.users;
DELETE FROM auth.identities;

-- 4. CADASTROS BASE
INSERT INTO public.cidades (nome, uf) VALUES 
('Crateús', 'CE'), ('Fortaleza', 'CE'), ('Sobral', 'CE'), ('Quixadá', 'CE'), ('Juazeiro do Norte', 'CE');

INSERT INTO public.niveis (descricao) VALUES 
('Ensino Médio Integrado'), ('Subsequente'), ('EJA Profissionalizante');

INSERT INTO public.escolas (nome, inep, cidade_id) VALUES 
('EEEP Manoel Mano', '23001234', (SELECT id FROM public.cidades WHERE nome = 'Crateús' LIMIT 1)),
('EEEP Paulo VI', '23005678', (SELECT id FROM public.cidades WHERE nome = 'Fortaleza' LIMIT 1)),
('EEEP Júlio França', '23009999', (SELECT id FROM public.cidades WHERE nome = 'Sobral' LIMIT 1));

INSERT INTO public.cursos (nome, escola_id, nivel_id, carga_horaria_obrigatoria) VALUES 
('Técnico em Informática', (SELECT id FROM public.escolas WHERE nome = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1), 400),
('Técnico em Redes', (SELECT id FROM public.escolas WHERE nome = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1), 400),
('Técnico em Enfermagem', (SELECT id FROM public.escolas WHERE nome = 'EEEP Paulo VI' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1), 320),
('Técnico em Administração', (SELECT id FROM public.escolas WHERE nome = 'EEEP Júlio França' LIMIT 1), (SELECT id FROM public.niveis WHERE descricao = 'Ensino Médio Integrado' LIMIT 1), 300);

-- 5. CRIAÇÃO MASSIVA DE USUÁRIOS (60 ALUNOS + ADMINS + ORIENTADORES)
DO $$
DECLARE
  hashed_pw TEXT := extensions.crypt('12345678', extensions.gen_salt('bf'));
  instance_id_val UUID := '00000000-0000-0000-0000-000000000000';
  i INT;
  curr_id UUID;
  curr_email TEXT;
  curr_name TEXT;
  curr_role TEXT;
  course_id UUID;
  resp_id UUID;
BEGIN
  FOR i IN 1..70 LOOP
    
    IF i = 1 THEN
      curr_email := 'coord@eeep.com.br'; curr_name := 'Coordenação Geral'; curr_role := 'admin'; curr_id := '00000000-0000-0000-0000-000000000001';
    ELSIF i = 2 THEN
      curr_email := 'prof.alberto@eeep.com.br'; curr_name := 'Professor Alberto'; curr_role := 'orientador'; curr_id := '00000000-0000-0000-0000-000000000002';
    ELSIF i = 3 THEN
      curr_email := 'prof.marcia@eeep.com.br'; curr_name := 'Professora Márcia'; curr_role := 'orientador'; curr_id := '00000000-0000-0000-0000-000000000003';
    ELSIF i = 4 THEN
      curr_email := 'supervisor.marcos@tech.com.br'; curr_name := 'Supervisor Marcos'; curr_role := 'supervisor'; curr_id := '00000000-0000-0000-0000-000000000004';
    ELSIF i = 5 THEN
      curr_email := 'admin@segecs.com.br'; curr_name := 'Administrador Sistema'; curr_role := 'admin'; curr_id := extensions.uuid_generate_v4();
    ELSE
      curr_email := 'aluno' || (i-5) || '@eeep.com.br'; curr_name := 'Aluno Exemplo ' || (i-5); curr_role := 'aluno'; curr_id := extensions.uuid_generate_v4();
    END IF;

    -- A. Inserir no AUTH.USERS
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
      '', '', '', '', '', '', '', ''
    );

    -- B. Inserir no AUTH.IDENTITIES
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (extensions.uuid_generate_v4(), curr_id, format('{"sub":"%s","email":"%s"}', curr_id, curr_email)::jsonb, 'email', curr_email, now(), now(), now());

    -- C. Registro na tabela ALUNOS
    IF curr_role = 'aluno' THEN
      INSERT INTO public.responsaveis (nome, cpf, telefone) 
      VALUES ('Responsável ' || i, '111.222.333-' || LPAD(i::text, 2, '0'), '(88) 99999-' || LPAD(i::text, 4, '0')) 
      RETURNING id INTO resp_id;

      -- Alterna cursos entre os alunos
      SELECT id INTO course_id FROM public.cursos ORDER BY (i % 4) LIMIT 1 OFFSET (i % 4);

      INSERT INTO public.alunos (profile_id, nome, matricula, cpf, data_nascimento, curso_id, responsavel_id, status)
      VALUES (curr_id, curr_name, '2024' || LPAD((i-5)::text, 4, '0'), '000.000.000-' || LPAD((i-5)::text, 2, '0'), '2006-05-15', course_id, resp_id, 
        CASE 
          WHEN (i-5) <= 35 THEN 'estagiando' 
          WHEN (i-5) <= 50 THEN 'pendente' 
          WHEN (i-5) <= 55 THEN 'concluido' 
          ELSE 'evadido' 
        END);
    END IF;
  END LOOP;
END $$;

-- 6. EMPRESAS E PARCEIROS
INSERT INTO public.empresas (razao_social, cnpj, endereco, cidade_id, contato_nome, contato_email, convenio_numero, convenio_validade) VALUES 
('Crateús Tech Solutions', '11.111.111/0001-01', 'Rua da Inovação, 50', (SELECT id FROM public.cidades WHERE nome = 'Crateús' LIMIT 1), 'Carla Mendes', 'contato@crateustech.com', 'CONV-2024-01', '2026-12-31'),
('Inovação Digital ME', '22.222.222/0001-02', 'Av. Central, 1000', (SELECT id FROM public.cidades WHERE nome = 'Fortaleza' LIMIT 1), 'João Paulo', 'jp@inovacao.com', 'CONV-2024-02', '2025-06-30'),
('SoftHouse Sistemas', '33.333.333/0001-03', 'Rua dos Devs, 12', (SELECT id FROM public.cidades WHERE nome = 'Sobral' LIMIT 1), 'Marta Rocha', 'marta@softhouse.com', 'CONV-2024-03', '2027-01-15');

-- Orientadores
INSERT INTO public.orientadores (profile_id, nome, cpf, escola_id) VALUES
('00000000-0000-0000-0000-000000000002', 'Prof. Alberto Santos', '222.333.444-55', (SELECT id FROM public.escolas WHERE nome = 'EEEP Manoel Mano' LIMIT 1)),
('00000000-0000-0000-0000-000000000003', 'Profa. Márcia Oliveira', '333.444.555-66', (SELECT id FROM public.escolas WHERE nome = 'EEEP Paulo VI' LIMIT 1));

-- Supervisores
INSERT INTO public.supervisores (profile_id, nome, empresa_id, cargo, formacao) VALUES
('00000000-0000-0000-0000-000000000004', 'Eng. Marcos Viana', (SELECT id FROM public.empresas WHERE razao_social = 'Crateús Tech Solutions' LIMIT 1), 'Gerente de TI', 'Engenharia de Software'),
(NULL, 'Dra. Ana Beatriz', (SELECT id FROM public.empresas WHERE razao_social = 'Inovação Digital ME' LIMIT 1), 'Coordenadora Técnica', 'Ciência da Computação');

-- 7. OPERACIONAL: VAGAS E ESTÁGIOS
INSERT INTO public.vagas (empresa_id, curso_id, titulo, descricao, quantidade, status) VALUES 
((SELECT id FROM public.empresas ORDER BY id LIMIT 1), (SELECT id FROM public.cursos ORDER BY id LIMIT 1), 'Desenvolvimento Web Jr', 'Atuar no front-end com React e Tailwind.', 10, 'aberta'),
((SELECT id FROM public.empresas ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM public.cursos ORDER BY id LIMIT 1), 'Suporte em Redes', 'Manutenção de infraestrutura e servidores.', 5, 'aberta'),
((SELECT id FROM public.empresas ORDER BY id LIMIT 1 OFFSET 2), (SELECT id FROM public.cursos ORDER BY id LIMIT 1 OFFSET 3), 'Auxiliar Administrativo', 'Gestão de documentos e planilhas.', 8, 'aberta');

-- Criar Estágios para alunos com status 'estagiando'
INSERT INTO public.estagios (aluno_id, vaga_id, orientador_id, supervisor_id, data_inicio, data_fim, status, carga_horaria_total, carga_horaria_diaria)
SELECT 
  a.id, 
  (SELECT id FROM public.vagas ORDER BY random() LIMIT 1),
  (SELECT id FROM public.orientadores ORDER BY random() LIMIT 1),
  (SELECT id FROM public.supervisores ORDER BY random() LIMIT 1),
  current_date - interval '3 months', 
  current_date + interval '3 months', 
  'ativo',
  400,
  6
FROM public.alunos a WHERE a.status = 'estagiando';

-- 8. REGISTROS DE ATIVIDADES (FREQUÊNCIA, VISITAS, AVALIAÇÕES)

-- Frequência para todos os estágios ativos (últimos 30 dias)
INSERT INTO public.frequencias (estagio_id, data, horas_realizadas, atividades, validado_supervisor, validado_orientador)
SELECT 
  e.id, 
  current_date - (n || ' days')::interval, 
  6, 
  'Desenvolvimento de módulos do sistema e correções de bugs.', 
  (n > 5), -- Algumas não validadas para teste
  (n > 10)
FROM public.estagios e CROSS JOIN generate_series(1, 30) as n;

-- Visitas Técnicas
INSERT INTO public.visitas (estagio_id, data_visita, tipo, resumo, observacoes)
SELECT 
  e.id, 
  current_date - interval '1 month', 
  CASE WHEN random() > 0.5 THEN 'presencial' ELSE 'remota' END,
  'Visita de acompanhamento técnico para verificar o progresso das atividades.',
  'O aluno demonstra boa evolução e integração com a equipe.'
FROM public.estagios e ORDER BY random() LIMIT 15;

-- Avaliações Pedagógicas
INSERT INTO public.avaliacoes (estagio_id, tipo, nota, comentarios, data_avaliacao)
SELECT 
  e.id, 
  1, 
  (8 + random() * 2), 
  'Excelente desempenho técnico e proatividade.',
  current_date - interval '1 month'
FROM public.estagios e ORDER BY random() LIMIT 20;

-- Projetos Sociais
INSERT INTO public.projetos_sociais (aluno_id, titulo, descricao, horas_estimadas, status, data_execucao)
SELECT 
  a.id, 
  'Oficina de Informática Básica ' || a.nome, 
  'Ministrar aulas de informática para a comunidade carente local.',
  30,
  CASE WHEN random() > 0.5 THEN 'executado' ELSE 'planejado' END,
  CASE WHEN random() > 0.5 THEN current_date - interval '15 days' ELSE NULL END
FROM public.alunos a WHERE a.status IN ('estagiando', 'concluido') LIMIT 25;

-- 9. FINALIZAÇÃO
NOTIFY pgrst, 'reload schema';
