# Stage 1: Builder
# Usa una imagen de Node.js para instalar dependencias y construir la aplicación frontend
# node:18-alpine o node:20-alpine son buenas opciones ligeras
FROM node:18-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor de construcción
WORKDIR /app

# Copia los archivos de configuración de dependencias (package.json, yarn.lock, package-lock.json)
# Esto permite a Docker cachear la instalación de dependencias. Si estos archivos no cambian,
# la instalación de dependencias no se repite en builds futuras.
COPY package.json ./
# Si usas yarn, descomenta la siguiente línea:
# COPY yarn.lock ./
# Si usas npm, package-lock.json se copiará automáticamente con package.json si existe.

# Instala las dependencias del proyecto frontend
RUN npm install
# Si usas yarn, descomenta la siguiente línea:
# RUN yarn install

# Copia el resto del código fuente de tu aplicación frontend
# Asegúrate de que tu código fuente está en el directorio ./frontend/
COPY . .

# Ejecuta el comando de construcción de tu aplicación frontend
# Este comando varía según el framework (React, Angular, Vue, etc.)
# Asegúrate de que este comando genere los archivos estáticos en un directorio (comúnmente 'build' o 'dist')
RUN npm run build

# Stage 2: Server
# Usa una imagen ligera de Nginx para servir los archivos estáticos generados en la etapa anterior
FROM nginx:alpine

# Copia tu archivo de configuración personalizado de Nginx a la ubicación correcta
# Asegúrate de que tienes un archivo nginx.conf en tu directorio ./frontend/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Elimina los archivos estáticos por defecto de Nginx (opcional pero limpia)
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos estáticos construidos SOLAMENTE desde la etapa 'builder'
# La ruta /app/build debe coincidir con el directorio de salida de tu comando 'npm run build' en la etapa builder
# /usr/share/nginx/html es el directorio donde Nginx sirve contenido por defecto
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto por defecto de Nginx
EXPOSE 80

# Comando principal para iniciar Nginx en primer plano (necesario para que el contenedor no se detenga)
ENTRYPOINT ["nginx", "-g", "daemon off;"]