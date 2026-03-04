# Estágio 1: Build da aplicação React
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Definir URL da API (o Nginx fará o proxy de /api para o backend)
ENV REACT_APP_API_URL=/api

RUN npm run build

# Estágio 2: Servir com Nginx
FROM nginx:alpine

# Copiar build para o diretório do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
