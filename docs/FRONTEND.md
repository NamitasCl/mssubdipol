# Frontend (React + Vite)

Este documento describe la arquitectura del frontend, componentes principales, páginas y comunicación con el backend.

## Stack
- React 18, Vite
- React-Bootstrap (UI)
- axios (HTTP)

## Estructura general
- `src/App.jsx`: configuración de rutas y layout base
- `src/api/*.js`: clientes HTTP (e.g., `nodosApi.js`)
- `src/pages/*`: páginas y vistas principales (e.g., `auditoria_servicios_especiales/AuditoriaMemos.jsx`)
- `src/components/*`: componentes reutilizables (selects async, contextos)

## Patrones de componentes
- Contenedores (pages) que manejan estado y llamadas a API
- Componentes presentacionales para renderizar tablas/listas
- Hooks/contexto: `useAuth` para credenciales / unidad del usuario

## Página: Auditoría de Memos
Archivo: `frontend/src/pages/auditoria_servicios_especiales/AuditoriaMemos.jsx`

Características:
- Filtros por rango de fechas (datetime-local, paso de 60s)
- Tipo de fecha: "FECHA REGISTRO" (createdAt) o "FECHA DEL HECHO" (fecha)
- Filtro por unidades o por IDs de memo
- Opción de consulta global PMSUBDIPOL (con restricciones de filtros)
- Normalización de memos (personas, drogas, vehículos) para visualización

Conversión de fechas:
- Helper `toUTCISO(str) => new Date(str).toISOString()`
- Se envían `fechaInicioUtc` y `fechaTerminoUtc` al backend

## Cliente API
Archivo: `frontend/src/api/nodosApi.js`

Endpoints usados:
- POST `/servicios-especiales` (consulta por filtros)
- POST `/servicios-especiales/ids` (por IDs)
- POST `/servicios-especiales/estadisticas` (estadísticas)
- POST `/servicios-especiales/pmsubdipol/global` (consulta global)

Ejemplo de uso:
```js
import {consultaMemosServiciosEspeciales} from "../api/nodosApi";
const filtros = { fechaInicioUtc: "2025-09-01T04:00:00Z", fechaTerminoUtc: "2025-09-02T03:59:00Z", tipoFecha: "FECHA REGISTRO" };
const data = await consultaMemosServiciosEspeciales(filtros);
```

## Rutas
- Definidas en `App.jsx` con React Router
- Páginas principales: Dashboard, Auditoría de Memos, etc.

## Utils y Helpers
- Normalizadores de entidades (personas, drogas, vehículos)
- Colores/estados para UI

## Estándares de código (JSDoc sugerido)
- Documentar funciones utilitarias y clientes API con JSDoc
- Tipar objetos de filtros y respuestas con typedefs JSDoc cuando sea posible
