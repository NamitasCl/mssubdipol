# Guía de Contribución

Gracias por contribuir a MSSUBDIPOL. Este documento define estándares y prácticas recomendadas.

## Flujo de trabajo
1. Crear rama a partir de `main` o `develop`: `feature/xxx` o `fix/xxx`
2. Commits pequeños y descriptivos (convencional opcional: feat, fix, docs, refactor)
3. Pull request con descripción de cambios, capturas/logs si aplica
4. Revisiones de código obligatorias

## Estándares de código
- Java (backend):
  - Usar nombres claros y consistentes
  - Añadir JavaDoc a servicios y métodos públicos no triviales
  - Manejo de fechas con `OffsetDateTime` y normalización a UTC
- JavaScript (frontend):
  - JSDoc para helpers y clientes API
  - Componentes funcionales con hooks
  - Evitar lógica compleja en JSX; extraer a helpers/hooks

## Pruebas
- Unitarias en módulos donde aplique
- Validar rutas críticas: filtros por fecha (registro vs hecho), estadisticas

## Estilo
- Formateo por defecto del IDE (o Prettier en frontend)
- Evitar warnings y code smells obvios

## Seguridad
- Nunca subir secretos al repo
- JWT y cabeceras Authorization en llamadas protegidas

## Commits
- Mensajes claros, en imperativo breve
- Referenciar issue/tarea cuando sea posible

