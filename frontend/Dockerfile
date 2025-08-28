# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copia ambos para cachear bien y mantener versiones exactas
COPY package*.json ./
RUN npm ci            # ← usa el lock, instala deps exactas

# Copia el resto del código
COPY . .

# Build (Vite genera /dist)
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html/turnos/
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]git 
