-- SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado
-- Schema de Banco de Dados Refatorado (Idempotente)

-- 1. Extensões e Configurações
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- 2. Funções Auxiliares
CREATE OR REPLACE FUNCTION public.fn_valida_status_estagio() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.situacao = 'Ativo' AND NEW.data_fim_previsto < CURRENT_DATE THEN
        NEW.situacao := 'Concluído';
    END IF;

    IF NEW.data_inicio > NEW.data_fim_previsto THEN
        RAISE EXCEPTION 'Erro: A data de início não pode ser posterior à data de término.';
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Tabelas de Configuração (Sem dependências externas)

-- Níveis de Acesso
CREATE TABLE IF NOT EXISTS public.sys_niveis_acesso (
    id_nivel SERIAL PRIMARY KEY,
    nivel VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cidades
CREATE TABLE IF NOT EXISTS public.cad_cidades (
    id_cidade SERIAL PRIMARY KEY,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cursos
CREATE TABLE IF NOT EXISTS public.cad_cursos (
    id_curso SERIAL PRIMARY KEY,
    nome_curso VARCHAR(100) NOT NULL,
    eixo_curso VARCHAR(100) NOT NULL,
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabelas de Entidades Principais

-- Usuários do Sistema
CREATE TABLE IF NOT EXISTS public.sys_usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_nivel INTEGER NOT NULL REFERENCES public.sys_niveis_acesso(id_nivel),
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alunos
CREATE TABLE IF NOT EXISTS public.cad_alunos (
    id_aluno SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    nasc DATE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    id_cidade INTEGER NOT NULL REFERENCES public.cad_cidades(id_cidade),
    bairro VARCHAR(100),
    zona VARCHAR(20),
    id_curso INTEGER REFERENCES public.cad_cursos(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT,
    turma VARCHAR(100),
    observacoes TEXT,
    inform_egressa TEXT,
    facebook VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escolas
CREATE TABLE IF NOT EXISTS public.cad_escolas (
    id_escola SERIAL PRIMARY KEY,
    id_cidade INTEGER NOT NULL REFERENCES public.cad_cidades(id_cidade),
    inep VARCHAR(10) NOT NULL UNIQUE,
    nome_escola VARCHAR(100) NOT NULL,
    endereco_escola VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concedentes (Empresas)
CREATE TABLE IF NOT EXISTS public.cad_concedentes (
    id_concedente SERIAL PRIMARY KEY,
    id_sice INTEGER,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    nome_fantasia VARCHAR(100) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    id_cidade INTEGER NOT NULL REFERENCES public.cad_cidades(id_cidade),
    nome_titular VARCHAR(100),
    telefone_com VARCHAR(20),
    telefone_tit VARCHAR(20),
    email_tit VARCHAR(100),
    supervisor VARCHAR(100),
    telefone_sup VARCHAR(20),
    email_sup VARCHAR(100),
    horario_fun VARCHAR(100),
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Responsáveis
CREATE TABLE IF NOT EXISTS public.cad_responsaveis (
    id_responsavel SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14),
    telefone VARCHAR(20) NOT NULL,
    id_cidade INTEGER REFERENCES public.cad_cidades(id_cidade),
    bairro VARCHAR(100),
    observacoes TEXT,
    id_aluno INTEGER REFERENCES public.cad_alunos(id_aluno) ON DELETE CASCADE,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estágios
CREATE TABLE IF NOT EXISTS public.cad_estagios (
    id_estagio SERIAL PRIMARY KEY,
    id_aluno INTEGER NOT NULL REFERENCES public.cad_alunos(id_aluno),
    id_concedente INTEGER NOT NULL REFERENCES public.cad_concedentes(id_concedente),
    data_inicio DATE NOT NULL,
    data_fim_previsto DATE NOT NULL,
    data_rescisao DATE,
    carga_horaria_semanal INTEGER,
    valor_bolsa NUMERIC(10,2),
    valor_transporte NUMERIC(10,2),
    tipo_estagio VARCHAR(20) NOT NULL,
    apolice_seguro VARCHAR(50),
    seguradora VARCHAR(100),
    situacao VARCHAR(20) DEFAULT 'Ativo',
    observacoes TEXT,
    dt_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Views e Gatilhos

-- View de Detalhes do Estágio
CREATE OR REPLACE VIEW public.vw_detalhes_estagio AS
 SELECT e.id_estagio,
    e.situacao,
    e.tipo_estagio,
    e.data_inicio,
    e.data_fim_previsto,
    a.id_aluno,
    a.nome AS aluno_nome,
    a.matricula,
    a.cpf AS aluno_cpf,
    a.telefone AS aluno_telefone,
    a.email AS aluno_email,
    c.id_concedente,
    c.nome_fantasia AS empresa_nome,
    c.cnpj AS empresa_cnpj,
    c.supervisor AS nome_supervisor,
    c.email_sup AS email_supervisor,
    c.telefone_sup AS telefone_supervisor,
    cid.cidade AS cidade_estagio,
    cid.uf AS uf_estagio
   FROM public.cad_estagios e
     JOIN public.cad_alunos a ON e.id_aluno = a.id_aluno
     JOIN public.cad_concedentes c ON e.id_concedente = c.id_concedente
     JOIN public.cad_cidades cid ON c.id_cidade = cid.id_cidade;

-- Trigger de Validação de Estágio
DROP TRIGGER IF EXISTS trg_valida_status_estagio ON public.cad_estagios;
CREATE TRIGGER trg_valida_status_estagio 
    BEFORE INSERT OR UPDATE ON public.cad_estagios 
    FOR EACH ROW EXECUTE FUNCTION public.fn_valida_status_estagio();

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_situacao_estagio ON public.cad_estagios(situacao);
CREATE INDEX IF NOT EXISTS idx_nome_aluno ON public.cad_alunos(nome);
