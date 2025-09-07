# Módulo: AUTH

## Propósito
Autenticación y autorización mediante JWT. Gestiona usuarios, roles y permisos.

## Estructura
- `AuthApplication.java`: punto de entrada
- Controllers:
  - `AuthController`: endpoints de autenticación
  - `RolesController`: gestión de roles/permisos
- Security:
  - `SecurityConfig`: configuración HTTP/security
  - `JwtAuthenticationFilter`: filtro de validación JWT
  - `CustomAuthenticationProvider`: autenticación custom (AD u orígenes internos)
- Model/Repository:
  - `Usuario`, `Rol`, `Permiso` + repositorios Spring Data
- Services:
  - `UsuarioService`, `RolService`
- Util:
  - `JwtUtil`: firma y validación de tokens

## Endpoints (principales)
- `POST /api/auth/login` → emite JWT
- `GET /api/auth/roles` → lista roles
- `POST /api/auth/roles/asignar` → asigna rol a usuario

## Configuración
- Variables: `JWT_SECRET`, `JWT_EXPIRATION`, integraciones AD si aplica
- Perfiles: `application.yml` y overrides por entorno

## Seguridad
- Añadir cabecera `Authorization: Bearer <token>` en llamadas a APIs protegidas

