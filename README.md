# SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado

## 📖 Sobre o SEGECS

O **SEGECS** é uma solução de governança acadêmica de alta performance, projetada especificamente para centralizar, automatizar e monitorar o ciclo de vida completo do Estágio Curricular Supervisionado. A plataforma atua como uma ponte inteligente entre instituições de ensino, empresas parceiras e estudantes, eliminando burocracias manuais e garantindo total conformidade com a **Lei nº 11.788/2008**.

Diferente de sistemas genéricos, o SEGECS oferece uma arquitetura **multi-formação**, permitindo que coordenadores gerenciem simultaneamente diversos cursos técnicos e profissionais (como Enfermagem, Administração, Redes, Edificações, entre outros). Cada curso possui sua própria parametrização de carga horária e competências, permitindo que a instituição escale sua operação de estágios sem perder o controle individualizado de cada contrato.

Com uma interface moderna e orientada a dados, o sistema transforma o acompanhamento pedagógico, antes disperso em papéis e planilhas, em indicadores estratégicos em tempo real, fornecendo segurança jurídica através da geração automatizada de documentos e integridade técnica por meio de políticas rigorosas de proteção de dados.

## 🏛️ Arquitetura do Sistema

O SEGECS utiliza uma arquitetura moderna baseada em **SPA (Single Page Application)** com uma infraestrutura **Serverless**, garantindo escalabilidade, segurança e alta performance.

### 🏗️ Stack Tecnológica

- **Frontend:** [React 18](https://react.dev/) com [Vite](https://vitejs.dev/) e [TypeScript](https://www.typescriptlang.org/).
- **Estilização:** [TailwindCSS](https://tailwindcss.com/) e [Framer Motion](https://www.framer.com/motion/) para animações fluídas.
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS e Realtime).
- **Gerenciamento de Estado:** [React Query (TanStack)](https://tanstack.com/query/latest) para cache e sincronização de dados.
- **Formulários:** [React Hook Form](https://react-hook-form.com/) integrado com [Zod](https://zod.dev/) para validação rigorosa.
- **Documentação:** [@react-pdf/renderer](https://react-pdf.org/) para geração dinâmica de PDFs no cliente.

### 🛡️ Camada de Segurança

- **Supabase Auth:** Autenticação segura com suporte a persistência de sessão configurável ("Lembre-se de mim").
- **Row Level Security (RLS):** Políticas de acesso direto no banco de dados garantindo que alunos vejam apenas seus dados, enquanto coordenadores acessam a visão gerencial.
- **Snapshot Logic:** Cargas horárias são copiadas para os contratos no momento da criação, protegendo registros históricos contra alterações futuras nas grades curriculares.

## 🚀 Funcionalidades Principais

### 📋 Gestão Administrativa (Multi-Curso)

- **Cursos Customizáveis:** Cadastro de qualquer formação com definição de CH obrigatória específica.
- **Gestão de Parceiros:** Controle de empresas com monitoramento de validade de convênios.
- **Banco de Talentos:** Cadastro detalhado de alunos, orientadores e supervisores de campo.

### ⚙️ Fluxo de Alocação e Vagas

- **Gestão de Vagas:** Publicação e controle de oportunidades por curso e empresa.
- **Alocação Inteligente:** Vínculo automático entre aluno, vaga, orientador e supervisor.
- **Preenchimento Automático:** O sistema detecta a CH do curso e sugere os termos do contrato instantaneamente.

### 📈 Monitoramento e Controle (Compliance)

- **Registro de Frequência:** Lançamento diário de atividades com validação de horários.
- **Visitas Técnicas:** Módulo completo para registro de acompanhamento presencial ou remoto.
- **Avaliações Pedagógicas:** Sistema de notas e feedbacks por período.
- **Dashboard de Inteligência:** Gráficos de distribuição, alertas de contratos vencendo e pendências de avaliação.

### 🎓 Documentação Automática (PDF)

- **TCE (Termo de Compromisso):** Geração instantânea conforme legislação vigente.
- **Plano de Atividades:** Detalhamento das competências técnicas em desenvolvimento.
- **TRE (Termo de Realização):** Documento final de conclusão com resumo de carga horária.
- **Exportação SICE:** Preparação de dados em CSV estruturado para o sistema da SEDUC-CE.

## 🚦 Começando

### 📋 Pré-requisitos

- **Node.js** (v18+)
- **npm** ou **pnpm**
- Instância do **Supabase**

### ⚙️ Instalação e Configuração

1. **Clonar e Instalar:**

   ```bash
   git clone https://github.com/prof-raimundo/segecs.git
   cd segecs
   npm install
   ```

2. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz:

   ```env
   VITE_PUBLIC_SUPABASE_URL=sua_url_supabase
   VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
   ```

3. **Configurar Banco de Dados:**
   - Execute o script em `database/supabase_schema.sql` no editor SQL do Supabase.
   - (Opcional) Execute o `database/seed.sql` para popular o sistema com dados de teste (70 usuários, 15 visitas, frequências, etc.).

4. **Executar:**
   ```bash
   npm run dev
   ```

## 📂 Estrutura de Pastas

```text
src/
├── app/            # Configurações globais, rotas e provedores
├── components/     # Componentes UI reutilizáveis (Pagination, Loading, etc)
├── features/       # Módulos de negócio (alunos, estagios, visitas, etc)
│   └── [feature]/  # Componentes, páginas e serviços específicos
├── hooks/          # Hooks customizados (usePagination, useAuth, useSupabaseCrud)
├── lib/            # Configurações de bibliotecas (supabase cliente, utils)
└── types/          # Definições de tipos TypeScript e banco de dados
```

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

<p align="center">
  Desenvolvido com ❤️ para transformar a educação técnica.
</p>
