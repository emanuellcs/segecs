# SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado

![Status](https://img.shields.io/badge/status-ativo-success)
![License](https://img.shields.io/badge/license-ISC-blue)
![Stack](https://img.shields.io/badge/stack-PERN-blueviolet)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

O **SEGECS** é uma aplicação web *Full Stack* desenvolvida para otimizar e digitalizar o controle de estágios curriculares supervisionados. O sistema centraliza a gestão de alunos, instituições concedentes, documentação e vínculos de estágio, garantindo integridade de dados e facilidade operacional para coordenadores e secretarias escolares.

## 📑 Índice

- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Documentação da API](#-documentação-da-api)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuição](#-contribuição)
- [Licença e Autor](#-licença-e-autor)

---

## 🏗 Arquitetura e Tecnologias

O projeto segue a arquitetura **MVC (Model-View-Controller)** no backend e uma estrutura baseada em componentes no frontend.

### Backend (Server)
-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Banco de Dados:** PostgreSQL (Relacional)
-   **Autenticação:** JWT (JSON Web Tokens)
-   **Segurança:** Middleware de tratamento de erros e proteção de rotas.

### Frontend (Client)
-   **Biblioteca:** React.js (v18)
-   **Estilização:** Tailwind CSS
-   **Roteamento:** React Router
-   **HTTP Client:** Axios
-   **Feedback UI:** SweetAlert2

---

## ✨ Funcionalidades

O sistema oferece um painel administrativo completo com as seguintes capacidades:

-   **Dashboard:** Visão geral quantitativa de alunos, escolas e processos.
-   **Controle de Acesso:** Login seguro e gerenciamento de usuários administrativos.
-   **Gestão Acadêmica:**
    -   Cadastro de **Alunos** com dados pessoais e sociais.
    -   Gestão de **Cursos** e **Níveis** de ensino.
-   **Gestão de Parceiros:**
    -   Cadastro de **Escolas** e empresas concedentes.
    -   Base de dados de **Cidades**.
-   **Gestão de Pessoas:**
    -   Cadastro de **Responsáveis** (Supervisores/Orientadores).

---

## 📋 Pré-requisitos

Certifique-se de que sua máquina possui:

-   **Node.js** (v18 ou superior)
-   **npm** (Gerenciador de pacotes padrão do Node)
-   **PostgreSQL** (v14 ou superior)
-   **Git** (Opcional, para clonagem)

---

## 🚀 Instalação e Configuração

### 1. Configuração do Banco de Dados
O sistema requer um banco PostgreSQL. Utilize os scripts fornecidos na pasta `database/` para criar a estrutura.

```bash
# 1. Crie o banco de dados
createdb segecs_db

# 2. Crie as tabelas (Schema)
psql -d segecs_db -f database/schema.sql

# 3. Aplique as migrações (Atualizações de estrutura)
psql -d segecs_db -f database/migration_add_social_fields.sql

# 4. (Opcional) Popule o banco com dados de teste
psql -d segecs_db -f database/seed.sql
```

### 2. Configuração do Backend
```bash
cd server
npm install

# Configure o arquivo .env (ver seção Variáveis de Ambiente)
cp ../.env.example .env

# Inicie o servidor
npm run dev
```
*O servidor rodará em: `http://localhost:5000`*

### 3. Configuração do Frontend
Abra um novo terminal:
```bash
cd client
npm install
npm start
```
*A aplicação abrirá automaticamente em: `http://localhost:3000`*

---

## 🔌 Documentação da API

A API RESTful serve os dados em formato JSON. Abaixo estão os principais recursos disponíveis.

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Autentica um usuário e retorna o token JWT. |

### Recursos Principais (CRUD)
A maioria dos recursos abaixo suporta os métodos `GET` (listar), `POST` (criar), `PUT` (atualizar) e `DELETE` (remover).

**Base URL:** `/api`

| Recurso | Endpoints Base | Descrição |
|---|---|---|
| **Alunos** | `/alunos` | Gestão de dados discentes. |
| **Escolas** | `/escolas` | Instituições de ensino e empresas parceiras. |
| **Cursos** | `/cursos` | Cursos técnicos ou superiores ofertados. |
| **Níveis** | `/niveis` | Níveis de ensino (Médio, Superior, etc). |
| **Cidades** | `/cidades` | Base de cidades para endereçamento. |
| **Responsáveis** | `/responsaveis` | Professores orientadores ou supervisores. |
| **Usuários** | `/usuarios` | Usuários do sistema (Requer permissão de admin). |

### Dashboard
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Retorna contagens e estatísticas para a Home. |

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na pasta **server/** com as seguintes configurações:

```ini
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=segecs_db

# Segurança (JWT)
JWT_SECRET=defina_uma_chave_secreta_complexa

# CORS (Frontend URL)
CLIENT_URL=http://localhost:3000
```

---

## 📂 Estrutura de Diretórios

O projeto é dividido em `client` (Frontend) e `server` (Backend).

```
SEGECS/
├── database/               # Scripts SQL (Schema, Seeds, Migrations)
├── client/                 # Frontend React
│   ├── public/             # Arquivos estáticos (HTML, Icons)
│   └── src/
│       ├── components/     # Componentes (Forms, Lists, Layout)
│       ├── pages/          # Páginas da aplicação (Vistas)
│       ├── services/       # Configuração da API (Axios)
│       └── utils/          # Funções auxiliares e constantes
├── server/                 # Backend Node.js
│   ├── config/             # Configurações (DB connection)
│   ├── controllers/        # Lógica de Negócio (Handlers)
│   ├── middleware/         # Middlewares (Auth, Error Handling)
│   └── routes/             # Definição das rotas da API
└── SETUP.md                # Guia detalhado de configuração
```

---

## 📜 Scripts Disponíveis

### Backend (`/server`)
-   `npm run dev`: Inicia o servidor em modo de desenvolvimento (com Nodemon).
-   `npm start`: Inicia o servidor em modo de produção.

### Frontend (`/client`)
-   `npm start`: Inicia o servidor de desenvolvimento do React.
-   `npm run build`: Cria a versão otimizada para produção na pasta `build`.

---

## 🤝 Contribuição

1.  Faça um **Fork** do projeto.
2.  Crie uma Branch para sua feature (`git checkout -b feature/MinhaFeature`).
3.  Commit suas mudanças (`git commit -m 'Adiciona funcionalidade X'`).
4.  Push para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um **Pull Request**.

---

## 📄 Licença e Autor

Este projeto está sob a licença **ISC**.

**Desenvolvido por:** Prof. Raimundo N. de Sousa (Raiworld)