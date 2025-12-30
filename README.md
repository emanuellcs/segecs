# SEGECS - Sistema Escolar de Gestão do Estágio Curricular Supervisionado

Aplicação web desenvolvida com PERN Stack (PostgreSQL, Express, React, Node.js) para gestão de estágios curriculares supervisionados.

## 🛠️ Tecnologias:

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Package Manager**: npm

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) (vem com o Node.js)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 ou superior)
- [Git](https://git-scm.com/) (opcional)

## 🚀 Instalação e Configuração

### 1. Clone o repositório (se aplicável)

```bash
git clone <repository-url>
cd SEGECS
```

### 2. Configurar o Banco de Dados

1. Instale e inicie o PostgreSQL
2. Crie um novo banco de dados:

```sql
CREATE DATABASE segecs_db;
```

3. Execute o script de schema para criar as tabelas:

```bash
psql -U postgres -d segecs_db -f database/schema.sql
```

Ou conecte-se ao banco e execute o conteúdo do arquivo `database/schema.sql` manualmente.

### 3. Configurar o Backend (Server)

1. Navegue para a pasta do servidor:

```bash
cd server
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na pasta `server/` (copie do `.env.example` na raiz):

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=segecs_db

JWT_SECRET=seu_jwt_secret_aqui
CLIENT_URL=http://localhost:3000
```

**Importante**: Substitua `sua_senha_aqui` e `seu_jwt_secret_aqui` com valores reais.

4. Inicie o servidor:

```bash
# Modo desenvolvimento (com nodemon - reinicia automaticamente)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:5000`

### 4. Configurar o Frontend (Client)

1. Abra um novo terminal e navegue para a pasta do cliente:

```bash
cd client
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm start
```

O frontend estará rodando em `http://localhost:3000` e abrirá automaticamente no navegador.

## 📁 Estrutura do Projeto

```
SEGECS/
├── client/                 # Frontend React
│   ├── public/            # Arquivos públicos
│   ├── src/               # Código fonte
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   ├── utils/         # Funções utilitárias
│   │   └── context/       # Context API (se necessário)
│   ├── package.json
│   └── ...
├── server/                # Backend Node.js/Express
│   ├── config/            # Configurações (DB, etc.)
│   ├── controllers/       # Lógica de negócio
│   ├── middleware/        # Middlewares customizados
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API
│   ├── server.js          # Arquivo principal do servidor
│   ├── package.json
│   └── ...
├── database/              # Scripts SQL
│   ├── schema.sql         # Schema do banco de dados
│   └── seed.sql           # Dados de exemplo (opcional)
├── .gitignore
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md
```

## 🔌 Endpoints da API

### Status
- `GET /api/health` - Verifica o status da API e conexão com o banco

### (Endpoints adicionais serão documentados conforme o desenvolvimento)

## 🧪 Testando a Aplicação

1. Certifique-se de que o PostgreSQL está rodando
2. Inicie o servidor backend (porta 5000)
3. Inicie o frontend (porta 3000)
4. Acesse `http://localhost:3000` no navegador
5. A página inicial deve exibir o status da conexão com a API

## 📝 Scripts Disponíveis

### Backend
- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)

### Frontend
- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa os testes

## 🔒 Segurança

- **Nunca** commite o arquivo `.env` no repositório
- Use variáveis de ambiente para informações sensíveis
- Gere um `JWT_SECRET` forte e único
- Mantenha as dependências atualizadas

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👥 Autor

Prof. Raimundo N. de Sousa (Raiworld)

## 📞 Suporte

Para suporte, abra uma issue no repositório do projeto.

---

**Nota**: Este é um projeto inicial. A estrutura e funcionalidades serão expandidas conforme o desenvolvimento progride.

>>>>>>> bd27619 (Meu primeiro commit)
>>>>>>> 05af568 (Meu primeiro commit)
