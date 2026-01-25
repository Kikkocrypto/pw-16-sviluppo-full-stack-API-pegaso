# Multi-stage Dockerfile per React + Vite frontend
# Stage 1: Build dell'applicazione React
FROM node:20-alpine AS build

WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package.json package-lock.json* ./

# Installa le dipendenze
# Usa npm ci se package-lock.json esiste, altrimenti npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia il codice sorgente
COPY . .

# Argomento build-time per l'URL dell'API
# Default: http://localhost:8080/api (perché il JavaScript viene eseguito nel browser)
# Il browser accede al backend tramite la porta esposta (localhost:8080)
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build dell'applicazione (output in /app/dist)
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:alpine

# Copia la configurazione personalizzata di Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file buildati dal stage precedente
COPY --from=build /app/dist /usr/share/nginx/html

# Espone la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
