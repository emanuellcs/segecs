# Usar uma imagem Node leve
FROM node:lts-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta que o servidor usa
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
