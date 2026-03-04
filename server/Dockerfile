# Usar uma imagem Node leve
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies como nodemon)
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta que o servidor usa
EXPOSE 5000

# Comando padrão (será sobrescrito para npm run dev no docker-compose)
CMD ["npm", "start"]
