# Base de Datos y Modelos

Este documento resume las entidades de dominio y campos relevantes. La base de datos es PostgreSQL y almacena timestamps en UTC.

## Consideraciones de fechas
- Campos temporales como `fecha` (evento) y `createdAt` (registro) se almacenan como `timestamp with time zone` en UTC.
- El filtrado por fecha en backend usa `OffsetDateTime` y normaliza a UTC.

## Entidades principales

### FichaMemo
Tabla: `public.ficha_memo`
Campos (referencia desde entidad Java):
- `id: bigint`
- `formulario: text`
- `fecha: timestamptz` (fecha del hecho)
- `created_at: timestamptz` (fecha de registro)
- `tipo: text`
- `folioBrain: text`
- `ruc: text`
- `modusDescripcion: text`
- `unidad_id: bigint` (FK a ListaUnidad)
Relaciones:
- `fichaPersonas` (OneToMany)
- `fichaArmas` (OneToMany)
- `fichaDrogas` (OneToMany)
- `fichaDineros` (OneToMany)
- `fichaFuncionarios` (OneToMany)
- `fichaMuniciones` (OneToMany)
- `fichaVehiculos` (OneToMany)
- `fichaOtrasEspecies` (OneToMany)

### ListaUnidad
- Referenciada por `FichaMemo.unidad`. Contiene `id` y `nombreUnidad`.

### Relaciones y carga
- Consultas por ID hacen `LEFT JOIN FETCH` de `fichaPersonas` y `estados` para evitar N+1.

## Índices y rendimiento
- Recomendado indexar `fecha`, `created_at`, `unidad_id` y combinaciones usadas en consultas (`formulario` + rango de fechas, etc.).

