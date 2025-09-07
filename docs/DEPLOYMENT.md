# Guía de Despliegue

Este documento describe cómo desplegar el sistema usando Docker y docker-compose, las variables de entorno y consideraciones de Nginx.

## Requisitos
- Docker 24+
- docker-compose
- Acceso a imágenes o capacidad de construir localmente

## Docker Compose
Archivos relevantes en la raíz del repositorio:
- `docker-compose.yml`
- `docker-compose.override.yml`
- `docker-compose.prod.yml`

Estrategia típica:
```sh
# Desarrollo
docker-compose up -d

# Producción (ejemplo)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Variables de entorno
Backend (nodos):
- `SPRING_PROFILES_ACTIVE` (dev|prod)
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- Otros específicos del módulo

Auth:
- `SPRING_PROFILES_ACTIVE`
- `JWT_SECRET`, `JWT_EXPIRATION`
- Configuración de AD si aplica (según dto/controladores)

Frontend:
- `VITE_NODOS_CONSULTA_API_URL` (ej: http://localhost:8080/api/nodos)
- Otras URLs de APIs

## Nginx (referencia genérica)
- Reverse proxy para servicios backend
- Servir build estático del frontend
- Forzar HTTPS y encabezados de seguridad (HSTS, X-Content-Type-Options, etc.)

Ejemplo (esquemático):
```
server {
  listen 80;
  server_name ejemplo.tld;

  location /api/nodos/ {
    proxy_pass http://nodos:8080/api/nodos/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /api/auth/ {
    proxy_pass http://auth:8081/api/auth/;
  }

  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }
}
```

## Observabilidad
- Exponer actuator (si se habilita) tras autenticación
- Logs a stdout para agregación por contenedor

## Migraciones / Datos
- Recomendar uso de Flyway/Liquibase (si aplica) para esquema

