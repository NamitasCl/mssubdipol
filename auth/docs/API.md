# Documentación de APIs

Este documento describe los endpoints REST principales expuestos por los módulos NODOS y AUTH. Los ejemplos usan JSON. Donde aplica, se incluyen ejemplos de request/response.

> Nota de fechas y zonas horarias
> - El frontend envía `fechaInicioUtc` y `fechaTerminoUtc` como instantes ISO‑8601 con offset (Z).
> - El backend (NODOS) usa `OffsetDateTime` y normaliza a UTC. La base de datos almacena UTC.

## 1. NODOS — Servicios Especiales
Base: `/api/nodos/servicios-especiales`

### 1.1 POST `/api/nodos/servicios-especiales`
Lista memos según filtros.

Body (FichaMemoRequestDTO):
```json
{
  "fechaInicioUtc": "2025-09-01T04:00:00Z",
  "fechaTerminoUtc": "2025-09-02T03:59:00Z",
  "tipoFecha": "FECHA REGISTRO | FECHA DEL HECHO",
  "tipoMemo": "MEMORANDO DILIGENCIAS | ... | null",
  "region": null,
  "unidad": null,
  "unidades": ["BICRIM ÑUÑOA"],
  "memoIds": null
}
```

Response 200:
```json
[
  {
    "id": 6407,
    "formulario": "MEMORANDO DILIGENCIAS",
    "fecha": "2025-09-01T05:42:23.468323Z",
    "folioBrain": "...",
    "ruc": "...",
    "modusDescripcion": "...",
    "unidad": { "id": 123, "nombreUnidad": "BICRIM ÑUÑOA" },
    "fichaPersonas": [ { "id": 1, "rut": "...", "nombre": "...", "estados": ["VÍCTIMA"] } ],
    "fichaArmas": [],
    "fichaDrogas": [],
    "fichaDineros": [],
    "fichaFuncionarios": [],
    "fichaMuniciones": [],
    "fichaVehiculos": [],
    "fichaOtrasEspecies": [],
    "estadoRevision": "SIN_REVISAR",
    "observacionesRevision": null,
    "nombreRevisor": null,
    "fechaRevision": null
  }
]
```

Reglas de filtrado relevantes:
- `tipoFecha = "FECHA DEL HECHO"` filtra por campo `fecha` (evento).
- `tipoFecha = "FECHA REGISTRO"` filtra por `createdAt` (registro).
- Si el término llega con precisión de minutos, el servicio lo hace inclusivo hasta el fin del minuto.

### 1.2 POST `/api/nodos/servicios-especiales/ids`
Lista memos por IDs explícitos.
```json
{ "memoIds": [6407, 6465] }
```
Response: igual a 1.1.

### 1.3 POST `/api/nodos/servicios-especiales/estadisticas`
Devuelve estadísticas agregadas a partir de los filtros.
Body: igual a 1.1.
Response (resumen):
```json
{
  "personas": [ {"rut": "...", "nombre": "...", "memoId": 6407, ...} ],
  "armas": [ ... ],
  "drogas": [ ... ],
  "dineros": [ ... ],
  "vehiculos": [ ... ],
  "municiones": [ ... ],
  "otrasEspecies": [ ... ],
  "resumenMemos": [ {"memoId": 6407, "memoFolio": "...", "totalPersonas": 1, ...} ]
}
```

### 1.4 POST `/api/nodos/servicios-especiales/pmsubdipol/global`
Consulta global (todas las unidades) permitida para PMSUBDIPOL.
- Acepta solo: `fechaInicioUtc`, `fechaTerminoUtc`, `tipoFecha`, `tipoMemo` (si no es "TODOS").

## 2. AUTH — Autenticación
Base: `/api/auth` (ruta estimada por estructura del módulo; ver SecurityConfig y controllers reales del módulo auth)

Endpoints típicos:
- POST `/login`: recibe credenciales/AD y entrega JWT.
- GET `/roles`: devuelve roles disponibles.
- POST `/roles/asignar`: asigna rol a usuario.

DTOs relevantes (según módulo auth):
- `AuthRequest`, `AuthResponse`, `Usuario`, `Rol`, `Permiso`.

Ejemplo de login:
```json
POST /api/auth/login
{
  "username": "usuario",
  "password": "secreto"
}
```
Response:
```json
{
  "token": "<jwt>",
  "usuario": {"username": "usuario", "roles": ["ADMIN"]}
}
```

## 3. Códigos de estado
- 200 OK: operación exitosa
- 400 Bad Request: error en parámetros o validación
- 401 Unauthorized / 403 Forbidden: autenticación/autorización fallida
- 500 Internal Server Error: error inesperado del servidor

## 4. Seguridad
- Autenticación vía JWT en cabecera Authorization: `Bearer <token>` (para endpoints protegidos).
- Autorización según roles/permisos definidos en módulo auth.

