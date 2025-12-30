-- SEGECS Database Schema
-- Sistema Escolar de Gestão do Estágio Curricular Supervisionado

-- Create database (execute this separately if needed)
-- CREATE DATABASE segecs_db;

-- Connect to database
-- \c segecs_db;
--
-- PostgreSQL database dump
--

-- \restrict RVK3SDuvRRmTIP3TXCxDh3eY0E6Gc4yh7KEao7ElM5cepKskdCJHzu6zDx5JekL

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: fn_valida_status_estagio(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_valida_status_estagio() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Se tentar inserir 'Ativo' com data passada, muda para Conclu¡do
    IF NEW.situacao = 'Ativo' AND NEW.data_fim_previsto < CURRENT_DATE THEN
        NEW.situacao := 'Conclu¡do';
    END IF;

    -- Valida‡Æo de datas
    IF NEW.data_inicio > NEW.data_fim_previsto THEN
        RAISE EXCEPTION 'Erro: A data de in¡cio nÆo pode ser posterior … data de t‚rmino.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_valida_status_estagio() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cad_alunos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_alunos
(
    id_aluno integer NOT NULL DEFAULT nextval('cad_alunos_id_aluno_seq'::regclass),
    matricula character varying(20) COLLATE pg_catalog."default" NOT NULL,
    nome character varying(100) COLLATE pg_catalog."default" NOT NULL,
    rg character varying(20) COLLATE pg_catalog."default",
    cpf character varying(14) COLLATE pg_catalog."default" NOT NULL,
    nasc date NOT NULL,
    telefone character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    id_cidade integer NOT NULL,
    bairro character varying(100) COLLATE pg_catalog."default",
    zona character varying(20) COLLATE pg_catalog."default",
    curso character varying(100) COLLATE pg_catalog."default",
    turma character varying(100) COLLATE pg_catalog."default",
    observacoes text COLLATE pg_catalog."default",
    inform_egressa text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    facebook character varying(255) COLLATE pg_catalog."default",
    linkedin character varying(255) COLLATE pg_catalog."default",
    github character varying(255) COLLATE pg_catalog."default",
    id_curso integer,
    CONSTRAINT cad_alunos_pkey PRIMARY KEY (id_aluno),
    CONSTRAINT cad_alunos_cpf_key UNIQUE (cpf),
    CONSTRAINT cad_alunos_matricula_key UNIQUE (matricula),
    CONSTRAINT cad_alunos_id_cidade_fkey FOREIGN KEY (id_cidade)
        REFERENCES public.cad_cidades (id_cidade) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_cad_alunos_cad_cursos FOREIGN KEY (id_curso)
        REFERENCES public.cad_cursos (id_curso) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


ALTER TABLE public.cad_alunos OWNER TO postgres;

--
-- Name: cad_alunos_id_aluno_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_alunos_id_aluno_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_alunos_id_aluno_seq OWNER TO postgres;

--
-- Name: cad_alunos_id_aluno_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_alunos_id_aluno_seq OWNED BY public.cad_alunos.id_aluno;


--
-- Name: cad_cidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_cidades
(
    id_cidade integer NOT NULL DEFAULT nextval('cad_cidades_id_cidade_seq'::regclass),
    cidade character varying(100) COLLATE pg_catalog."default" NOT NULL,
    uf character(2) COLLATE pg_catalog."default" NOT NULL,
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_cidades_pkey PRIMARY KEY (id_cidade)
);


ALTER TABLE public.cad_cidades OWNER TO postgres;

--
-- Name: cad_cidades_id_cidade_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_cidades_id_cidade_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_cidades_id_cidade_seq OWNER TO postgres;

--
-- Name: cad_cidades_id_cidade_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_cidades_id_cidade_seq OWNED BY public.cad_cidades.id_cidade;


--
-- Name: cad_concedentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_concedentes
(
    id_concedente integer NOT NULL DEFAULT nextval('cad_concedentes_id_concedente_seq'::regclass),
    id_sice integer,
    cnpj character varying(18) COLLATE pg_catalog."default" NOT NULL,
    nome_fantasia character varying(100) COLLATE pg_catalog."default" NOT NULL,
    razao_social character varying(100) COLLATE pg_catalog."default" NOT NULL,
    id_cidade integer NOT NULL,
    nome_titular character varying(100) COLLATE pg_catalog."default",
    telefone_com character varying(20) COLLATE pg_catalog."default",
    telefone_tit character varying(20) COLLATE pg_catalog."default",
    email_tit character varying(100) COLLATE pg_catalog."default",
    supervisor character varying(100) COLLATE pg_catalog."default",
    telefone_sup character varying(20) COLLATE pg_catalog."default",
    email_sup character varying(100) COLLATE pg_catalog."default",
    horario_fun character varying(100) COLLATE pg_catalog."default",
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_concedentes_pkey PRIMARY KEY (id_concedente),
    CONSTRAINT cad_concedentes_cnpj_key UNIQUE (cnpj),
    CONSTRAINT cad_concedentes_id_cidade_fkey FOREIGN KEY (id_cidade)
        REFERENCES public.cad_cidades (id_cidade) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


ALTER TABLE public.cad_concedentes OWNER TO postgres;

--
-- Name: cad_concedentes_id_concedente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_concedentes_id_concedente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_concedentes_id_concedente_seq OWNER TO postgres;

--
-- Name: cad_concedentes_id_concedente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_concedentes_id_concedente_seq OWNED BY public.cad_concedentes.id_concedente;


--
-- Name: cad_cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_cursos
(
    id_curso integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    nome_curso character varying(100) COLLATE pg_catalog."default" NOT NULL,
    eixo_curso character varying(100) COLLATE pg_catalog."default" NOT NULL,
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_cursos_pkey PRIMARY KEY (id_curso)
);


ALTER TABLE public.cad_cursos OWNER TO postgres;

--
-- Name: cad_cursos_id_curso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cad_cursos ALTER COLUMN id_curso ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cad_cursos_id_curso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cad_escolas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_escolas
(
    id_escola integer NOT NULL DEFAULT nextval('cad_escolas_id_escola_seq'::regclass),
    id_cidade integer NOT NULL,
    inep character varying(10) COLLATE pg_catalog."default" NOT NULL,
    nome_escola character varying(100) COLLATE pg_catalog."default" NOT NULL,
    endereco_escola character varying(100) COLLATE pg_catalog."default" NOT NULL,
    uf character(2) COLLATE pg_catalog."default" NOT NULL,
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    telefone character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT cad_escolas_pkey PRIMARY KEY (id_escola)
);

ALTER TABLE IF EXISTS public.cad_escolas
    OWNER to postgres;


ALTER TABLE public.cad_escolas OWNER TO postgres;

--
-- Name: cad_escolas_id_escola_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_escolas_id_escola_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_escolas_id_escola_seq OWNER TO postgres;

--
-- Name: cad_escolas_id_escola_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_escolas_id_escola_seq OWNED BY public.cad_escolas.id_escola;


--
-- Name: cad_estagios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.cad_ofertas
(
    id_oferta integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    id_concedente integer NOT NULL,
    qtd_vagas integer NOT NULL,
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_ofertas_pkey PRIMARY KEY (id_oferta),
    CONSTRAINT fk_concedente FOREIGN KEY (id_concedente)
        REFERENCES public.cad_concedentes (id_concedente) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.cad_ofertas
    OWNER to postgres;


--
-- Name: cad_estagios; Type: TABLE; Schema: public; Owner: postgres
--


CREATE TABLE IF NOT EXISTS public.cad_estagios
(
    id_estagio integer NOT NULL DEFAULT nextval('cad_estagios_id_estagio_seq'::regclass),
    id_aluno integer NOT NULL,
    id_concedente integer NOT NULL,
    data_inicio date NOT NULL,
    data_fim_previsto date NOT NULL,
    data_rescisao date,
    carga_horaria_semanal integer,
    valor_bolsa numeric(10,2),
    valor_transporte numeric(10,2),
    tipo_estagio character varying(20) COLLATE pg_catalog."default" NOT NULL,
    apolice_seguro character varying(50) COLLATE pg_catalog."default",
    seguradora character varying(100) COLLATE pg_catalog."default",
    situacao character varying(20) COLLATE pg_catalog."default" DEFAULT 'Ativo'::character varying,
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_estagios_pkey PRIMARY KEY (id_estagio),
    CONSTRAINT cad_estagios_id_aluno_fkey FOREIGN KEY (id_aluno)
        REFERENCES public.cad_alunos (id_aluno) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT cad_estagios_id_concedente_fkey FOREIGN KEY (id_concedente)
        REFERENCES public.cad_concedentes (id_concedente) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


ALTER TABLE public.cad_estagios OWNER TO postgres;

--
-- Name: cad_estagios_id_estagio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_estagios_id_estagio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_estagios_id_estagio_seq OWNER TO postgres;

--
-- Name: cad_estagios_id_estagio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_estagios_id_estagio_seq OWNED BY public.cad_estagios.id_estagio;


--
-- Name: cad_responsaveis; Type: TABLE; Schema: public; Owner: postgres
--


CREATE TABLE IF NOT EXISTS public.cad_responsaveis
(
    id_responsavel integer NOT NULL DEFAULT nextval('cad_responsaveis_id_responsavel_seq'::regclass),
    nome character varying(100) COLLATE pg_catalog."default" NOT NULL,
    rg character varying(20) COLLATE pg_catalog."default",
    cpf character varying(14) COLLATE pg_catalog."default",
    telefone character varying(20) COLLATE pg_catalog."default" NOT NULL,
    id_cidade integer,
    bairro character varying(100) COLLATE pg_catalog."default",
    observacoes text COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cad_responsaveis_pkey PRIMARY KEY (id_responsavel),
    CONSTRAINT cad_responsaveis_id_cidade_fkey FOREIGN KEY (id_cidade)
        REFERENCES public.cad_cidades (id_cidade) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


ALTER TABLE public.cad_responsaveis OWNER TO postgres;

--
-- Name: cad_responsaveis_id_responsavel_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cad_responsaveis_id_responsavel_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cad_responsaveis_id_responsavel_seq OWNER TO postgres;

--
-- Name: cad_responsaveis_id_responsavel_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cad_responsaveis_id_responsavel_seq OWNED BY public.cad_responsaveis.id_responsavel;


--
-- Name: sys_niveis_acesso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.sys_niveis_acesso
(
    id_nivel integer NOT NULL DEFAULT nextval('sys_niveis_acesso_id_nivel_seq'::regclass),
    nivel character varying(50) COLLATE pg_catalog."default" NOT NULL,
    descricao character varying(255) COLLATE pg_catalog."default",
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sys_niveis_acesso_pkey PRIMARY KEY (id_nivel),
    CONSTRAINT sys_niveis_acesso_nome_nivel_key UNIQUE (nivel)
);


ALTER TABLE public.sys_niveis_acesso OWNER TO postgres;

--
-- Name: sys_niveis_acesso_id_nivel_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sys_niveis_acesso_id_nivel_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_niveis_acesso_id_nivel_seq OWNER TO postgres;

--
-- Name: sys_niveis_acesso_id_nivel_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sys_niveis_acesso_id_nivel_seq OWNED BY public.sys_niveis_acesso.id_nivel;


--
-- Name: sys_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.sys_usuarios
(
    id_usuario integer NOT NULL DEFAULT nextval('sys_usuarios_id_usuario_seq'::regclass),
    id_nivel integer NOT NULL,
    nome_completo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    senha_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    ativo boolean DEFAULT true,
    dt_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sys_usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT sys_usuarios_email_key UNIQUE (email),
    CONSTRAINT sys_usuarios_id_nivel_fkey FOREIGN KEY (id_nivel)
        REFERENCES public.sys_niveis_acesso (id_nivel) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


ALTER TABLE public.sys_usuarios OWNER TO postgres;

--
-- Name: sys_usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sys_usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: sys_usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sys_usuarios_id_usuario_seq OWNED BY public.sys_usuarios.id_usuario;


--
-- Name: vw_detalhes_estagio; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_detalhes_estagio AS
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
   FROM (((public.cad_estagios e
     JOIN public.cad_alunos a ON ((e.id_aluno = a.id_aluno)))
     JOIN public.cad_concedentes c ON ((e.id_concedente = c.id_concedente)))
     JOIN public.cad_cidades cid ON ((c.id_cidade = cid.id_cidade)));


ALTER VIEW public.vw_detalhes_estagio OWNER TO postgres;

--
-- Name: cad_alunos id_aluno; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos ALTER COLUMN id_aluno SET DEFAULT nextval('public.cad_alunos_id_aluno_seq'::regclass);


--
-- Name: cad_cidades id_cidade; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_cidades ALTER COLUMN id_cidade SET DEFAULT nextval('public.cad_cidades_id_cidade_seq'::regclass);


--
-- Name: cad_concedentes id_concedente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_concedentes ALTER COLUMN id_concedente SET DEFAULT nextval('public.cad_concedentes_id_concedente_seq'::regclass);


--
-- Name: cad_escolas id_escola; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_escolas ALTER COLUMN id_escola SET DEFAULT nextval('public.cad_escolas_id_escola_seq'::regclass);


--
-- Name: cad_estagios id_estagio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_estagios ALTER COLUMN id_estagio SET DEFAULT nextval('public.cad_estagios_id_estagio_seq'::regclass);


--
-- Name: cad_responsaveis id_responsavel; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_responsaveis ALTER COLUMN id_responsavel SET DEFAULT nextval('public.cad_responsaveis_id_responsavel_seq'::regclass);


--
-- Name: sys_niveis_acesso id_nivel; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_niveis_acesso ALTER COLUMN id_nivel SET DEFAULT nextval('public.sys_niveis_acesso_id_nivel_seq'::regclass);


--
-- Name: sys_usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.sys_usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: cad_alunos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_alunos (id_aluno, matricula, nome, rg, cpf, nasc, telefone, email, id_cidade, bairro, zona, curso, turma, observacoes, inform_egressa, dt_cadastro, dt_atualizacao, facebook, linkedin, github, id_curso) FROM stdin;
5	654321	FRANCISCA LÚCIA SOARES DE SOUSA		73580503391	1960-04-01	(88)99358-1415	lucia.seraos@gmail.com	3		Rural	INFORMÁTICA	2025-27			2025-12-21 15:42:14.140771	2025-12-28 12:01:26.500967				2
3	123456789	RAIMUNDO NONATO DE SOUSA	27152326-8	362.679.703-10	1968-04-06	(88)99200-9331	raiworld68@gmail.com	5			INFORMÁTICA	2026-28		...	2025-12-20 15:39:21.940706	2025-12-28 12:23:57.174728				1
\.


--
-- Data for Name: cad_cidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_cidades (id_cidade, cidade, uf, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
3	MUCAMBO	CE	Pertence ao consórcio Pacujá	2025-12-21 21:11:49.021648	2025-12-21 21:11:49.021648
4	GRAÇA	CE	Pertence ao consórcio	2025-12-21 21:12:11.64746	2025-12-25 02:48:41.720358
5	PACUJÁ	CE	Polo do consórcio.	2025-12-21 21:12:40.193126	2025-12-28 13:52:31.250059
\.


--
-- Data for Name: cad_concedentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_concedentes (id_concedente, id_sice, cnpj, nome_fantasia, razao_social, id_cidade, nome_titular, telefone_com, telefone_tit, email_tit, supervisor, telefone_sup, email_sup, horario_fun, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
\.


--
-- Data for Name: cad_cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_cursos (id_curso, nome_curso, eixo_curso, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
4	TÉCNICO EM REDE DE COMPUTADORES	Informação e Comunicação	Foco em planejar, instalar, configurar, operar e realizar manutenção na infraestrutura.	2025-12-24 22:44:32.866292	2025-12-26 22:30:42.794868
2	TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS	Informação e Comunicação	Foco em criação, manutenção e implementação de soluções tecnológicas.	2025-12-24 21:42:02.654432	2025-12-28 09:55:24.460174
1	TÉCNICO EM INFORMÁTICA	Informação e Comunicação.	Foco e atuar em um amplo espectro de atividades práticas e objetivas relacionadas ao funcionamento, manutenção e desenvolvimento de sistemas computacionais, redes e infraestrutura digital.	2025-12-24 21:41:40.415698	2025-12-28 10:08:06.983617
\.


--
-- Data for Name: cad_escolas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_escolas (id_escola, id_cidade, inep, nome_escola, endereco_escola, uf, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
\.


--
-- Data for Name: cad_estagios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_estagios (id_estagio, id_aluno, id_concedente, data_inicio, data_fim_previsto, data_rescisao, carga_horaria_semanal, valor_bolsa, valor_transporte, tipo_estagio, apolice_seguro, seguradora, situacao, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
\.


--
-- Data for Name: cad_responsaveis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cad_responsaveis (id_responsavel, id_aluno, nome, parentesco, rg, cpf, telefone, id_cidade, bairro, observacoes, dt_cadastro, dt_atualizacao) FROM stdin;
\.


--
-- Data for Name: sys_niveis_acesso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sys_niveis_acesso (id_nivel, nivel, descricao, dt_cadastro, dt_atualizacao) FROM stdin;
1	Administrador	Acesso total ao sistema	2025-12-20 13:39:10.145076	2025-12-20 13:39:10.145076
2	Orientador de Estágio	Gestão de alunos e concedentes	2025-12-20 13:39:10.145076	2025-12-20 13:39:10.145076
3	Leitura	Apenas visualização de relatórios	2025-12-20 13:39:10.145076	2025-12-27 01:06:05.058803
\.


--
-- Data for Name: sys_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sys_usuarios (id_usuario, id_nivel, nome_completo, email, senha_hash, ativo, dt_cadastro, dt_atualizacao) FROM stdin;
7	1	RAIMUNDO NONATO DE SOUSA	raiworld68@gmail.com	$2a$10$VotkUpv/LBIhNK8baqGHJ.Jhoa8rsxFmJ5WnyTFpz3IACB6cDtDSW	t	2025-12-21 17:33:11.700611	2025-12-21 17:33:11.700611
8	2	MAYKSON MOURÃO MAGALHÃES CAMELO	maykson@gmail.com	$2a$10$4HYsZ5vMS9KUXwHc95jM7uaR7pI2CXZidLoyfS5nk5Ln8.2KDfVcO	t	2025-12-21 17:34:04.433553	2025-12-21 17:34:04.433553
11	3	FRANCISCA LÚCIA SOARES DE SOUSA	lucia.seraos@gmail.com	$2a$10$GAHBYv9vWaJa2/vBdOZSuOypQpsT6Ljqz81KuWGrzh50QVVZsvzC2	\N	2025-12-28 13:38:12.166871	2025-12-28 13:38:12.166871
\.


--
-- Name: cad_alunos_id_aluno_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_alunos_id_aluno_seq', 9, true);


--
-- Name: cad_cidades_id_cidade_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_cidades_id_cidade_seq', 6, true);


--
-- Name: cad_concedentes_id_concedente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_concedentes_id_concedente_seq', 1, false);


--
-- Name: cad_cursos_id_curso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_cursos_id_curso_seq', 12, true);


--
-- Name: cad_escolas_id_escola_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_escolas_id_escola_seq', 1, false);


--
-- Name: cad_estagios_id_estagio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_estagios_id_estagio_seq', 1, false);


--
-- Name: cad_responsaveis_id_responsavel_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cad_responsaveis_id_responsavel_seq', 1, false);


--
-- Name: sys_niveis_acesso_id_nivel_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sys_niveis_acesso_id_nivel_seq', 6, true);


--
-- Name: sys_usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sys_usuarios_id_usuario_seq', 11, true);


--
-- Name: cad_alunos cad_alunos_cpf_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos
    ADD CONSTRAINT cad_alunos_cpf_key UNIQUE (cpf);


--
-- Name: cad_alunos cad_alunos_matricula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos
    ADD CONSTRAINT cad_alunos_matricula_key UNIQUE (matricula);


--
-- Name: cad_alunos cad_alunos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos
    ADD CONSTRAINT cad_alunos_pkey PRIMARY KEY (id_aluno);


--
-- Name: cad_cidades cad_cidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_cidades
    ADD CONSTRAINT cad_cidades_pkey PRIMARY KEY (id_cidade);


--
-- Name: cad_concedentes cad_concedentes_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_concedentes
    ADD CONSTRAINT cad_concedentes_cnpj_key UNIQUE (cnpj);


--
-- Name: cad_concedentes cad_concedentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_concedentes
    ADD CONSTRAINT cad_concedentes_pkey PRIMARY KEY (id_concedente);


--
-- Name: cad_cursos cad_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_cursos
    ADD CONSTRAINT cad_cursos_pkey PRIMARY KEY (id_curso);


--
-- Name: cad_escolas cad_escolas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_escolas
    ADD CONSTRAINT cad_escolas_pkey PRIMARY KEY (id_escola);


--
-- Name: cad_estagios cad_estagios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_estagios
    ADD CONSTRAINT cad_estagios_pkey PRIMARY KEY (id_estagio);


--
-- Name: cad_responsaveis cad_responsaveis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_responsaveis
    ADD CONSTRAINT cad_responsaveis_pkey PRIMARY KEY (id_responsavel);


--
-- Name: sys_niveis_acesso sys_niveis_acesso_nome_nivel_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_niveis_acesso
    ADD CONSTRAINT sys_niveis_acesso_nome_nivel_key UNIQUE (nivel);


--
-- Name: sys_niveis_acesso sys_niveis_acesso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_niveis_acesso
    ADD CONSTRAINT sys_niveis_acesso_pkey PRIMARY KEY (id_nivel);


--
-- Name: sys_usuarios sys_usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_usuarios
    ADD CONSTRAINT sys_usuarios_email_key UNIQUE (email);


--
-- Name: sys_usuarios sys_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_usuarios
    ADD CONSTRAINT sys_usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_situacao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_situacao ON public.cad_estagios USING btree (situacao);


--
-- Name: cad_estagios trg_valida_status_estagio; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_valida_status_estagio BEFORE INSERT ON public.cad_estagios FOR EACH ROW EXECUTE FUNCTION public.fn_valida_status_estagio();


--
-- Name: cad_alunos cad_alunos_id_cidade_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos
    ADD CONSTRAINT cad_alunos_id_cidade_fkey FOREIGN KEY (id_cidade) REFERENCES public.cad_cidades(id_cidade);


--
-- Name: cad_concedentes cad_concedentes_id_cidade_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_concedentes
    ADD CONSTRAINT cad_concedentes_id_cidade_fkey FOREIGN KEY (id_cidade) REFERENCES public.cad_cidades(id_cidade);


--
-- Name: cad_estagios cad_estagios_id_aluno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_estagios
    ADD CONSTRAINT cad_estagios_id_aluno_fkey FOREIGN KEY (id_aluno) REFERENCES public.cad_alunos(id_aluno);


--
-- Name: cad_estagios cad_estagios_id_concedente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_estagios
    ADD CONSTRAINT cad_estagios_id_concedente_fkey FOREIGN KEY (id_concedente) REFERENCES public.cad_concedentes(id_concedente);


--
-- Name: cad_responsaveis cad_responsaveis_id_aluno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_responsaveis
    ADD CONSTRAINT cad_responsaveis_id_aluno_fkey FOREIGN KEY (id_aluno) REFERENCES public.cad_alunos(id_aluno) ON DELETE CASCADE;


--
-- Name: cad_responsaveis cad_responsaveis_id_cidade_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_responsaveis
    ADD CONSTRAINT cad_responsaveis_id_cidade_fkey FOREIGN KEY (id_cidade) REFERENCES public.cad_cidades(id_cidade);


--
-- Name: cad_alunos fk_cad_alunos_cad_cursos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cad_alunos
    ADD CONSTRAINT fk_cad_alunos_cad_cursos FOREIGN KEY (id_curso) REFERENCES public.cad_cursos(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_usuarios sys_usuarios_id_nivel_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_usuarios
    ADD CONSTRAINT sys_usuarios_id_nivel_fkey FOREIGN KEY (id_nivel) REFERENCES public.sys_niveis_acesso(id_nivel);


--
-- PostgreSQL database dump complete
--

\unrestrict RVK3SDuvRRmTIP3TXCxDh3eY0E6Gc4yh7KEao7ElM5cepKskdCJHzu6zDx5JekL

