# Módulo: commonservices

Servicios y utilidades compartidas entre módulos. Incluye APIs para catálogo de regiones/unidades consumidas por el frontend (e.g., `getRegionesUnidades`).

## Responsabilidades
- Exponer datos comunes (catálogos, listas)
- Reutilizables por NODOS y otras apps

## Integración con frontend
- `getRegionesUnidades()` desde `frontend/src/api/commonServicesApi.js` (referenciado por AuditoriaMemos.jsx)
