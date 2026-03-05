# SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado

O **SEGECS** é uma plataforma moderna e integrada desenvolvida para otimizar a gestão de estágios curriculares obrigatórios em Escolas Estaduais de Educação Profissional (EEEP) do Ceará. O sistema foi projetado para estar em **conformidade** com a **Lei Federal nº 11.788/2008** e as diretrizes do **Guia do Estágio da SEDUC-CE (SICE)**.

## 🎯 Objetivo do Sistema

Transformar o processo burocrático de gestão de estágios em um fluxo digital ágil, seguro e transparente, permitindo que coordenadores, orientadores e alunos foquem no que mais importa: o desenvolvimento profissional e pedagógico.

## 🛠️ Arquitetura e Tecnologia

O SEGECS utiliza uma arquitetura **Frontend-Only (Serverless)**, eliminando a necessidade de manter servidores backend complexos e garantindo alta escalabilidade e segurança.

- **Frontend:** React 18 + TypeScript + Vite (Performance e Tipagem Estrita)
- **Estilização:** Tailwind CSS (Interface moderna e responsiva)
- **Backend (BaaS):** Supabase
  - **Auth:** Autenticação robusta e RBAC (Role-Based Access Control).
  - **Database:** PostgreSQL com Row Level Security (RLS) para proteção de dados.
  - **Storage:** Armazenamento seguro de documentos (TCEs e Relatórios).
- **Gestão de Estado:** TanStack Query v5 (Sincronização de dados em tempo real).
- **Formulários:** React Hook Form + Zod (Validações complexas e segurança).
- **Documentação:** @react-pdf/renderer (Geração dinâmica de documentos oficiais).

## 📦 Módulos do Sistema

### 1. Gestão Operacional (Núcleo)

- **Vagas:** Cadastro de oportunidades por empresa, curso e eixo tecnológico.
- **Alocação Inteligente:** Vinculação de alunos a vagas, definindo datas, orientadores e supervisores.
- **Documentação Automática:** Geração instantânea de Termos de Compromisso de Estágio (TCE) e Planos de Atividades personalizados para Informática.

### 2. Acompanhamento Pedagógico

- **Registro de Frequência:** Lançamento diário de atividades e horas, com contador progressivo até a meta de 400h.
- **Validação Dupla:** Sistema de validação de horas pelo supervisor da empresa e orientador da escola.
- **Visitas Técnicas:** Histórico de acompanhamento in loco realizado pelos orientadores.

### 3. Avaliação e Responsabilidade Social

- **Ciclo de Notas:** Registro das 3 avaliações obrigatórias com cálculo automático de média.
- **Projeto Social:** Módulo para gestão do projeto obrigatório exigido pela SEDUC-CE após 300h de estágio.
- **Conclusão:** Emissão do Termo de Realização de Estágio (TRE) após cumprimento de metas.

### 4. Inteligência e Compliance

- **Dashboard Executivo:** Indicadores em tempo real de alunos estagiando, horas acumuladas e metas.
- **Alertas de Risco:** Notificações sobre contratos vencendo ou avaliações pendentes.
- **LGPD:** Gestão de consentimento para tratamento de dados sensíveis (CPF, Matrícula).

## 👥 Perfis de Acesso (RBAC)

- **Coordenador:** Visão total do sistema, gestão de cadastros base e relatórios SICE.
- **Orientador:** Gestão dos seus estagiários, lançamento de visitas e validação de frequências.
- **Aluno:** Lançamento de frequência diária, upload de documentos e visualização de progresso.
- **Supervisor (Empresa):** Acompanhamento técnico e validação de atividades na ponta.

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- Projeto no [Supabase](https://supabase.com)

### Configuração Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/segecs.git
   cd segecs
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as Variáveis de Ambiente:
   Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica
   ```
4. Banco de Dados:
   Copie o conteúdo de `supabase_schema.sql` e execute no SQL Editor do seu projeto Supabase.
5. Inicie o desenvolvimento:
   ```bash
   npm run dev
   ```

### Deploy no Vercel

Este repositório está otimizado para a Vercel. Basta conectar o GitHub, configurar as variáveis de ambiente e o sistema estará online em segundos com suporte nativo a rotas SPA (via `vercel.json`).

## ⚖️ Licença e Conformidade

Este software é fornecido sob licença para uso educacional em EEEPs do Ceará. Os dados coletados seguem rigorosamente a Lei Geral de Proteção de Dados (LGPD).
