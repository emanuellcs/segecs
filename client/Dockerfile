# Usar uma imagem Node leve
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta padrão do React
EXPOSE 3000

# Comando padrão (pode ser sobrescrito pelo docker-compose)
CMD ["npm", "start"]
