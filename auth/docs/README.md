# MSSUBDIPOL — Documentación Técnica

Este repositorio contiene los servicios y aplicaciones del sistema MSSUBDIPOL. Esta documentación técnica busca facilitar el on‑boarding de nuevos desarrolladores, mejorar la mantenibilidad y servir de referencia de arquitectura, APIs y despliegue.

Contenido principal:
- Visión general del proyecto y arquitectura
- Documentación de APIs (backend nodos, auth y endpoints de consulta)
- Guías de frontend (React + Vite)
- Modelo de datos y consideraciones de fechas (UTC/Chile)
- Guía de despliegue (Docker/Nginx/variables de entorno)
- Guía de contribución y estándares
- Documentación por módulos

## 1. Descripción general
MSSUBDIPOL es una plataforma para la consulta, auditoría y análisis de memos y formularios operativos. Incluye:
- Backend de consulta (nodos, Spring Boot)
- Servicio de autenticación (auth, Spring Boot con JWT)
- Frontend web (React + Vite)
- Módulos y servicios compartidos (commonservices, formularios, turnos)

## 2. Arquitectura general (alto nivel)
```mermaid
flowchart LR
  subgraph Frontend [Frontend (React + Vite)]
    UI[UI / Pages]
    APIClient[API Client (axios)]
  end

  subgraph Backend_Nodos [Backend NODOS (Spring Boot)]
    Controllers[REST Controllers]
    Services[Services]
    Repos[Repositories JPA]
    DB[(PostgreSQL)]
  end

  subgraph Auth [Auth (Spring Boot)]
    AuthCtrl[Auth Controllers]
    Jwt[JWT Provider]
  end

  UI -->|HTTP/JSON| APIClient
  APIClient -->|/api/nodos/...| Controllers
  Controllers --> Services --> Repos --> DB
  APIClient -->|/api/auth/...| AuthCtrl --> Jwt
```

## 3. Stack tecnológico
- Backend: Java 17+, Spring Boot, Spring Web, Spring Security (auth), Spring Data JPA
- Frontend: React, Vite, React-Bootstrap, axios
- Base de datos: PostgreSQL (timestamps en UTC)
- Contenedores: Docker, docker-compose

## 4. Requisitos del sistema
- Java 17+ (para servicios Spring Boot)
- Node.js 18+ y PNPM/NPM/Yarn (para frontend)
- Docker 24+ y docker-compose
- PostgreSQL 13+ (si se ejecuta fuera de Docker)

## 5. Por qué Spring Boot sobre Django
- Integración nativa con ecosistema Java corporativo (JPA, drivers, tooling)
- Tipado estático y compatibilidad con entornos JVM existentes
- Robustez en seguridad y observabilidad (actuator, filtros, providers)
- Facilidad para modelar consultas complejas con Spring Data JPA
- Equipo y código base ya estandarizado en Java en el dominio

## 6. Instalación y configuración (desarrollo)
1) Clonar el repositorio
2) Configurar variables de entorno (ver DEPLOYMENT.md)
3) Backend (nodos):
   - Importar como proyecto Maven/Gradle (pom.xml en cada módulo)
   - Ejecutar aplicación Spring Boot (perfil dev)
4) Auth: levantar servicio de autenticación Spring Boot
5) Frontend:
   - cd frontend
   - Copiar .env.example a .env.local y ajustar VITE_* (URLs backend)
   - Instalar dependencias y ejecutar: `npm install && npm run dev`

Para levantamiento con Docker, ver DEPLOYMENT.md.

## 7. Guías y siguientes pasos
- Arquitectura detallada: ARCHITECTURE.md
- APIs: API.md
- Frontend: FRONTEND.md
- Base de datos y entidades: DATABASE.md
- Despliegue: DEPLOYMENT.md
- Contribución: CONTRIBUTING.md
- Documentación por módulos: docs/modules/*.md
