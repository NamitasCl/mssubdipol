# Módulo: NODOS (Consulta)

## Propósito
Proveer endpoints de consulta y estadísticas sobre memos y entidades relacionadas.

## Estructura
- Controllers: `cl.investigaciones.nodos.controller.consulta`
  - `ServiciosEspecialesController`: endpoints para listar memos, por IDs, estadísticas, y consulta global PMSUBDIPOL.
- Services: `cl.investigaciones.nodos.service.consulta`
  - `ServiciosEspecialesService`: lógica de filtrado, normalización de fechas UTC, y mapeo a DTO.
  - `EstadisticasService`: agrega datos de memos a estructuras exportables.
- Repositories: `cl.investigaciones.nodos.repository.consulta`
  - `FichaMemoRepository`: consultas por rangos (`fecha` y `createdAt`) y por unidades.
- Domain: `cl.investigaciones.nodos.domain.entidadesconsulta`
  - `FichaMemo` y asociaciones (Personas, Armas, Drogas, etc.).
- DTOs: `cl.investigaciones.nodos.dto.consulta.*` y `cl.investigaciones.nodos.dto.serviciosespeciales.*`

## Endpoints principales
- POST `/api/nodos/servicios-especiales`
- POST `/api/nodos/servicios-especiales/ids`
- POST `/api/nodos/servicios-especiales/estadisticas`
- POST `/api/nodos/servicios-especiales/pmsubdipol/global`

## Manejo de Fechas
- El request usa `OffsetDateTime` en `fechaInicioUtc` y `fechaTerminoUtc`.
- El servicio normaliza a UTC y, si el término es exacto a minuto, lo extiende al fin de minuto (inclusivo).
- `tipoFecha` define el campo a usar: `FECHA DEL HECHO` -> `fecha`; `FECHA REGISTRO` -> `createdAt`.

## Repositorio (selectos)
- `findByFechaBetween(OffsetDateTime, OffsetDateTime)`
- `findByCreatedAtBetween(OffsetDateTime, OffsetDateTime)`
- `findByFormularioAndFechaBetweenAndUnidadIdIn(String, OffsetDateTime, OffsetDateTime, List<Long>)`
- `findByFormularioAndCreatedAtBetween(String, OffsetDateTime, OffsetDateTime)`

## Consideraciones de rendimiento
- Uso de `LEFT JOIN FETCH` en consulta por IDs para evitar N+1 al leer personas y estados.
- Índices recomendados: `fecha`, `created_at`, `unidad_id`, `formulario`.

