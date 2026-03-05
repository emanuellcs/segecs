# SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado

## 📖 Sobre o SEGECS

O **SEGECS** é uma plataforma robusta e moderna desenvolvida para automatizar e otimizar a gestão de estágios curriculares em instituições de ensino técnico. Focado inicialmente nas **EEEPs do Ceará (Escolas Estaduais de Educação Profissional)**, o sistema atende especificamente às demandas do curso **Técnico em Informática** e demais áreas.

O sistema foi concebido em total conformidade com a **Lei nº 11.788/2008 (Lei do Estágio)** e segue rigorosamente o **Guia de Estágio da SEDUC-CE**, garantindo segurança jurídica e pedagógica em todo o processo.

## 🚀 Funcionalidades Principais

O SEGECS cobre 100% do ciclo de vida do estágio:

- **Gestão de Cadastros:** Alunos, Empresas (convênios), Escolas, Orientadores e Supervisores.
- **Fluxo de Estágio:** Criação de vagas, seleção de alunos e formalização de contratos.
- **Documentação Automática:** Geração instantânea de **TCE (Termo de Compromisso de Estágio)** e **Plano de Atividades** em PDF.
- **Controle de Frequência:** Registro detalhado com cálculo automático para cumprimento das **400 horas** obrigatórias.
- **Avaliações Pedagógicas:** Formulários de desempenho preenchidos por supervisores e orientadores.
- **Acompanhamento de Visitas:** Registro de visitas técnicas in loco ou remotas.
- **Projeto Social e TRE:** Gestão de horas de contrapartida social e Termo de Realização de Estágio.
- **Dashboards Estratégicos:** Visão geral de alunos estagiando, vagas disponíveis e pendências documentais.
- **Exportação SICE:** Preparação de dados para integração/lançamento no sistema da SEDUC.
- **Interface Mobile-First:** Experiência otimizada para smartphones, tablets e desktops.

## 🛠️ Tecnologias Utilizadas

### Core

- **React 18.3** (Vite 6)
- **TypeScript**
- **Supabase** (Auth, Database, Storage, RLS)

### UI/UX

- **TailwindCSS** (Estilização Utilitária)
- **Framer Motion** (Animações de interface)
- **Radix UI** (Componentes acessíveis como Dialog/Modais)
- **Lucide React** (Pacote de ícones)
- **Sonner** (Notificações Toast)

### Ferramentas de Desenvolvimento

- **React Query (TanStack)** (Sincronização de dados e cache)
- **React Hook Form** + **Zod** (Formulários e validação de esquemas)
- **@react-pdf/renderer** (Geração dinâmica de documentos PDF)
- **date-fns** (Manipulação de datas)

## 📋 Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- Uma conta no **Supabase** (tier gratuito é suficiente)

## ⚙️ Configuração do Supabase

Siga os passos abaixo para preparar o backend:

1. **Criar Projeto:** No painel do Supabase, crie um novo projeto.
2. **Rodar o Schema SQL:** Vá em `SQL Editor` e execute o conteúdo do arquivo `database/supabase_schema.sql`. Este script cria:
   - Tabelas (`alunos`, `empresas`, `estagios`, `frequencias`, etc.)
   - Enums de acesso (`admin`, `coordenador`, `orientador`, `aluno`, `supervisor`)
   - Triggers para criação automática de perfis (`profiles`).
3. **Storage:** Crie um bucket chamado `documentos` e configure-o como público ou privado conforme sua necessidade de RLS.
4. **Políticas de RLS (Row Level Security):**
   - O sistema já possui políticas básicas no schema, garantindo que alunos vejam apenas seus dados e administradores tenham acesso total.

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`):

```env
VITE_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica
```

## 💻 Instalação e Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/prof-raimundo/segecs.git

# 2. Acesse a pasta
cd segecs

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

## 🌐 Deploy no Vercel

O projeto está otimizado para deploy na Vercel:

1. Conecte seu repositório GitHub à Vercel.
2. Configure as **Environment Variables** (`VITE_PUBLIC_SUPABASE_URL` e `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
3. O comando de build será `npm run build` e a pasta de saída será `dist`.
4. Ative a opção de **Framework Preset: Vite**.

## 📂 Estrutura de Pastas

```text
src/
├── app/            # Provedores e Definições de Rotas
├── components/     # Componentes UI reutilizáveis (Radix, Shadcn-like)
├── features/       # Módulos de negócio (Lógica principal por domínio)
│   ├── alunos/
│   ├── estagios/
│   ├── frequencia/
│   └── ...
├── hooks/          # Hooks customizados (useAuth, useSupabaseCrud)
├── layouts/        # Estruturas de página (Sidebar, AppLayout)
├── lib/            # Configurações de bibliotecas (Supabase, Utils)
├── types/          # Definições de Tipos TypeScript e Database
└── utils/          # Máscaras e funções utilitárias
```

## 📖 Como Usar (Fluxo Operacional)

1. **Início:** O administrador cadastra as **Empresas** com convênio ativo e os **Alunos** aptos.
2. **Vaga:** O **Orientador** cria uma vaga de estágio vinculada a uma empresa.
3. **Contrato:** Ao selecionar um aluno, o sistema gera o **TCE** e o **Plano de Atividades**.
4. **Execução:** O aluno registra sua **Frequência** diária. O sistema calcula o progresso até as 400h.
5. **Monitoramento:** O **Orientador** registra as visitas e acompanha as avaliações do **Supervisor** da empresa.
6. **Conclusão:** Após as 400h e aprovação nas avaliações, o sistema emite o **TRE** e prepara os dados para o **SICE**.

## ⚖️ Conformidade Legal e LGPD

- **Lei 11.788/2008:** Todos os campos obrigatórios para o TCE estão presentes.
- **LGPD:** O sistema utiliza criptografia do Supabase Auth e políticas de RLS para garantir que dados sensíveis (CPF, Matrícula) sejam acessados apenas por pessoas autorizadas.

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
