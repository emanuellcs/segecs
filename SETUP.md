# Guia Rápido de Configuração - SEGECS

## ✅ Estrutura Criada

A estrutura inicial da aplicação PERN Stack foi criada com sucesso! Aqui está o que foi configurado:

### 📁 Diretórios

- ✅ `client/` - Frontend React
- ✅ `server/` - Backend Node.js/Express
- ✅ `database/` - Scripts SQL

### 📦 Backend (Server)

- ✅ `package.json` com todas as dependências necessárias
- ✅ `server.js` - Servidor Express configurado
- ✅ `config/db.js` - Configuração do PostgreSQL
- ✅ Estrutura de diretórios: routes, controllers, models, middleware

### 🎨 Frontend (Client)

- ✅ `package.json` com dependências React
- ✅ Estrutura básica do React (App.js, index.js)
- ✅ Página inicial (Home.js) com verificação de conexão API
- ✅ Serviço de API configurado (services/api.js)
- ✅ Estrutura de diretórios organizada

### 🗄️ Banco de Dados

- ✅ `schema.sql` - Schema completo com tabelas principais
- ✅ `seed.sql` - Template para dados de exemplo

### ⚙️ Configuração

- ✅ `.gitignore` - Configurado para ignorar arquivos desnecessários
- ✅ `env.example` - Template de variáveis de ambiente
- ✅ `README.md` - Documentação completa

## 🚀 Próximos Passos

### 1. Instalar PostgreSQL

Se ainda não tiver instalado:

- Windows: Baixe do site oficial do PostgreSQL
- Configure uma senha para o usuário `postgres`

### 2. Criar o Banco de Dados

```bash
# Conecte-se ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE segecs_db;

# Execute o schema
\c segecs_db
\i database/schema.sql
# Ou copie e cole o conteúdo de database/schema.sql no psql
```

### 3. Configurar Variáveis de Ambiente

Na pasta `server/`, crie um arquivo `.env` baseado no `env.example`:

```bash
cd server
copy ..\env.example .env
# Edite o arquivo .env e configure suas credenciais do PostgreSQL
```

Edite o arquivo `.env` e altere:

- `DB_PASSWORD` - Sua senha do PostgreSQL
- `JWT_SECRET` - Gere uma chave secreta forte (pode usar: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

### 4. Instalar Dependências

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd client
npm install
```

### 5. Iniciar a Aplicação

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

O servidor estará em: `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd client
npm start
```

O frontend abrirá automaticamente em: `http://localhost:3000`

## 🧪 Testar a Conexão

1. Acesse `http://localhost:3000`
2. A página inicial deve mostrar:
   - Status: OK
   - Banco de Dados: Connected
   - Timestamp da última atualização

Se tudo estiver funcionando, você verá a mensagem de sucesso!

## 📝 Notas Importantes

- ⚠️ **Nunca** commite o arquivo `.env` no Git
- 🔒 Mantenha suas credenciais seguras
- 🔄 Use `npm run dev` no servidor para desenvolvimento (reinicia automaticamente)
- 📚 Consulte o `README.md` para mais detalhes

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `psql -U postgres -d segecs_db`

### Porta já em uso

- Backend: Altere `PORT` no `.env`
- Frontend: O React pedirá para usar outra porta automaticamente

### Erro ao instalar dependências

- Verifique se tem Node.js v18+ instalado: `node --version`
- Tente limpar o cache: `npm cache clean --force`
- Delete `node_modules` e `package-lock.json` e reinstale

---

**Status:** ✅ Estrutura inicial completa e pronta para desenvolvimento!
