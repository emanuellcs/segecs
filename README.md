# SEGECS

### Sistema Escolar de Gestão do Estágio Curricular Supervisionado

O **SEGECS** é uma aplicação web desenvolvida para auxiliar instituições de ensino na organização e no acompanhamento de estágios curriculares supervisionados. O sistema centraliza o cadastro de alunos, cursos, escolas e responsáveis, facilitando o controle administrativo dos estágios em conformidade com as exigências acadêmicas.

## 🛠️ Características Técnicas

O projeto utiliza a stack PERN (PostgreSQL, Express, React e Node.js) e foi organizado de forma modular para facilitar a manutenção e o crescimento das funcionalidades.

### Organização do Código:

- **Arquitetura por Funcionalidades**: O código é agrupado por domínios de negócio (Alunos, Usuários, Escolas, etc.), mantendo componentes, páginas e lógicas relacionadas próximos.
- **Absolute Imports**: Utiliza aliases (`@/`) para referenciar diretórios a partir da raiz do `src`, evitando caminhos relativos extensos.
- **Design System Base**: Componentes de interface reutilizáveis (`Button`, `Card`, `PageHeader`) centralizados para manter a consistência visual.
- **Validação de Dados**: Camada de validação no backend com `express-validator` para garantir a integridade dos dados recebidos.
- **Interface Responsiva**: Desenvolvida com Tailwind CSS, adaptando-se a diferentes tamanhos de tela.

### Estrutura de Diretórios

```text
.
├── client/                     # Frontend React 18
│   ├── src/
│   │   ├── features/           # Componentes e páginas por domínio
│   │   │   ├── alunos/
│   │   │   ├── auth/
│   │   │   └── ...
│   │   ├── layouts/            # Estruturas de layout da aplicação
│   │   ├── components/common/  # Componentes comuns de interface
│   │   ├── services/           # Comunicação com a API
│   │   └── utils/              # Funções auxiliares
│   ├── craco.config.js         # Configuração de aliases de importação
│   └── jsconfig.json           # Configuração de caminhos do VS Code
├── server/                     # Backend Node.js + Express
│   ├── modules/                # Controladores e rotas por domínio
│   │   ├── alunos/
│   │   ├── auth/
│   │   └── ...
│   ├── shared/                 # Configurações e middlewares globais
│   │   ├── config/             # Configuração de banco de dados
│   │   └── middleware/         # Autenticação e tratamento de erros
│   └── server.js               # Ponto de entrada da API
├── database/                   # Scripts SQL de schema e seed
└── docker-compose.yml          # Configuração dos containers
```

## 💻 Tecnologias Utilizadas

| Camada               | Tecnologia        | Versão |
| :------------------- | :---------------- | :----- |
| **Frontend**         | React             | 18     |
| **Estilização**      | Tailwind CSS      | 3      |
| **Backend**          | Node.js / Express | 18 / 4 |
| **Banco de Dados**   | PostgreSQL        | 17     |
| **Containers**       | Docker / Compose  | 3.8    |
| **Linter/Formatter** | ESLint / Prettier | 10 / 3 |

## 🐳 Execução com Docker

Para rodar o ambiente completo (Frontend, Backend e Banco de Dados):

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` no diretório `server/` com as seguintes variáveis:

```env
# Configuração do Servidor
PORT=5000
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password123
DB_NAME=segecs_db

# Segurança
JWT_SECRET=sua_chave_secreta_aqui
```

## 💎 Padronização de Código

Para garantir a qualidade do código, o projeto utiliza ESLint para análise estática e Prettier para formatação.

```bash
# No diretório /server
npm run format    # Formata os arquivos
npm run lint      # Verifica erros de estilo

# No diretório /client
npx prettier --write .
```

---

## 👥 Autor

**Prof. Raimundo N. de Sousa (Raiworld)**
