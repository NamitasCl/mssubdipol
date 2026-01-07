# Estructura de Datos - Formularios V2

## 📋 Campos del Formulario

### Frontend → Backend

Cuando guardas un formulario, se envía esta estructura:

```json
{
  "nombre": "Registro de Servicios",
  "descripcion": "Formulario para registrar servicios especiales",
  "limiteRespuestas": 100,
  "campos": [
    {
      "nombre": "email_contacto",           // ← ID TÉCNICO (único, sin espacios)
      "etiqueta": "Correo Electrónico",     // ← TEXTO VISIBLE
      "tipo": "email",
      "requerido": true,
      "opciones": "",
      "orden": 1
    },
    {
      "nombre": "fecha_servicio",
      "etiqueta": "Fecha del Servicio",
      "tipo": "date",
      "requerido": true,
      "opciones": "",
      "orden": 2
    },
    {
      "nombre": "tipo_servicio",
      "etiqueta": "Tipo de Servicio",
      "tipo": "select",
      "requerido": true,
      "opciones": "Custodia,Patrullaje,Fiscalización",  // ← Separadas por coma
      "orden": 3
    }
  ],
  "visibilidad": [...],
  "cuotas": [...]
}
```

## 🔑 Campo "nombre" (Nombre Técnico)

### ¿Qué es?
Es el **identificador único** del campo que usarás en el **backend** para acceder a los valores.

### Reglas:
- ✅ **Solo letras minúsculas, números y guión bajo** (`_`)
- ✅ **Sin espacios, sin acentos, sin caracteres especiales**
- ✅ **Único** dentro del formulario
- ✅ **Estable**: No debe cambiar después de creado (o perderás datos)

### Ejemplos:
```
Etiqueta                → Nombre Técnico (generado automáticamente)
─────────────────────────────────────────────────────────────────
"Correo Electrónico"    → "correo_electronico"
"Fecha de Inicio"       → "fecha_de_inicio"
"N° de Funcionarios"    → "n_de_funcionarios"
"Teléfono (+56)"        → "telefono_56"
```

### Generación Automática:
El sistema genera automáticamente el nombre técnico cuando escribes la etiqueta:

```javascript
// Transformación automática:
"Correo Electrónico del Jefe"
  → toLowerCase()                  → "correo electrónico del jefe"
  → quitar acentos                → "correo electronico del jefe"
  → quitar caracteres especiales   → "correo electronico del jefe"
  → reemplazar espacios por _      → "correo_electronico_del_jefe"
```

Puedes **editarlo manualmente** si lo prefieres.

## 🏷️ Campo "etiqueta" (Texto Visible)

### ¿Qué es?
Es el **texto que ve el usuario** en el formulario.

### Reglas:
- ✅ Puede tener **cualquier caracter**
- ✅ Puede tener espacios, acentos, símbolos
- ✅ Puede ser modificado después sin problemas

### Ejemplo en el formulario renderizado:
```html
<label>Correo Electrónico *</label>
<input type="email" name="correo_electronico" />
```

## 📊 Acceso a los Datos en el Backend

### Cuando un usuario completa el formulario:

**Frontend envía:**
```json
{
  "formularioId": 123,
  "datos": {
    "email_contacto": "juan@mail.com",
    "fecha_servicio": "2025-01-15",
    "tipo_servicio": "Patrullaje",
    "numero_funcionarios": 5
  }
}
```

**Backend recibe (Java):**
```java
@PostMapping("/registro")
public void guardarRegistro(@RequestBody FormularioRegistroRequestDTO dto) {
    Map<String, Object> datos = dto.getDatos();

    // Acceder por el NOMBRE TÉCNICO (no la etiqueta)
    String email = (String) datos.get("email_contacto");
    String fecha = (String) datos.get("fecha_servicio");
    String tipo = (String) datos.get("tipo_servicio");
    Integer numFuncionarios = (Integer) datos.get("numero_funcionarios");

    // Procesar...
}
```

## 🗂️ Estructura Completa por Tipo de Campo

### Text, Email, Tel, Number:
```json
{
  "nombre": "telefono_contacto",
  "etiqueta": "Teléfono",
  "tipo": "tel",
  "requerido": false,
  "opciones": "",
  "orden": 1
}
```

### Select, Radio, Checkbox:
```json
{
  "nombre": "region",
  "etiqueta": "Región",
  "tipo": "select",
  "requerido": true,
  "opciones": "Metropolitana,Valparaíso,Biobío,Araucanía",  // ← Separadas por coma
  "orden": 2
}
```

### Scale (Escala):
```json
{
  "nombre": "calificacion",
  "etiqueta": "Calificación del Servicio",
  "tipo": "scale",
  "requerido": true,
  "opciones": "",
  "min": 1,
  "max": 5,
  "orden": 3
}
```

### File (Archivo):
```json
{
  "nombre": "documento_adjunto",
  "etiqueta": "Adjuntar Documento",
  "tipo": "file",
  "requerido": false,
  "opciones": "",
  "tiposPermitidos": ".pdf,.doc,.docx",
  "orden": 4
}
```

### Funcionario o Unidad:
```json
{
  "nombre": "jefe_servicio",
  "etiqueta": "Jefe del Servicio",
  "tipo": "funcionario",
  "requerido": true,
  "opciones": "",
  "orden": 5
}
```

## 🔍 Consultas en Backend

### Buscar registros con valor específico:

**SQL (PostgreSQL con JSONB):**
```sql
-- Buscar registros donde tipo_servicio = "Patrullaje"
SELECT * FROM formulario_registro
WHERE datos->>'tipo_servicio' = 'Patrullaje';

-- Buscar registros donde numero_funcionarios > 10
SELECT * FROM formulario_registro
WHERE (datos->>'numero_funcionarios')::integer > 10;

-- Buscar registros que contienen texto en cualquier campo
SELECT * FROM formulario_registro
WHERE datos::text ILIKE '%urgente%';
```

**JPA (Java):**
```java
@Query(value =
    "SELECT * FROM formulario_registro " +
    "WHERE datos->>'tipo_servicio' = :tipo",
    nativeQuery = true)
List<FormularioRegistro> findByTipoServicio(@Param("tipo") String tipo);
```

## ⚠️ Advertencias Importantes

### 1. NO cambiar nombres técnicos después de crear el formulario
```
❌ MALO:
- Usuario crea campo: nombre="email_contacto"
- Hay 50 respuestas guardadas con ese nombre
- Cambias a: nombre="correo_electronico"
- Resultado: Pierdes acceso a las 50 respuestas anteriores

✅ BUENO:
- Crea el campo con nombre="email_contacto"
- Mantén ese nombre siempre
- Solo cambia la "etiqueta" si quieres mostrar otro texto
```

### 2. Nombres únicos
```
❌ MALO:
- Campo 1: nombre="fecha"
- Campo 2: nombre="fecha"  // ← Duplicado!

✅ BUENO:
- Campo 1: nombre="fecha_inicio"
- Campo 2: nombre="fecha_fin"
```

### 3. Evita nombres genéricos
```
❌ MALO:
nombre="campo1", nombre="dato", nombre="valor"

✅ BUENO:
nombre="email_contacto", nombre="fecha_servicio", nombre="tipo_operativo"
```

## 📝 Ejemplo Completo Real

### Formulario: "Registro de Operativo Policial"

```json
{
  "nombre": "Registro Operativo Policial",
  "descripcion": "Formulario para documentar operativos realizados",
  "limiteRespuestas": null,
  "campos": [
    {
      "nombre": "fecha_operativo",
      "etiqueta": "Fecha del Operativo",
      "tipo": "date",
      "requerido": true,
      "orden": 1
    },
    {
      "nombre": "hora_inicio",
      "etiqueta": "Hora de Inicio",
      "tipo": "time",
      "requerido": true,
      "orden": 2
    },
    {
      "nombre": "hora_termino",
      "etiqueta": "Hora de Término",
      "tipo": "time",
      "requerido": true,
      "orden": 3
    },
    {
      "nombre": "tipo_operativo",
      "etiqueta": "Tipo de Operativo",
      "tipo": "select",
      "requerido": true,
      "opciones": "Control vehicular,Fiscalización,Patrullaje preventivo,Operativo especial",
      "orden": 4
    },
    {
      "nombre": "jefe_operativo",
      "etiqueta": "Jefe del Operativo",
      "tipo": "funcionario",
      "requerido": true,
      "orden": 5
    },
    {
      "nombre": "unidad_responsable",
      "etiqueta": "Unidad Responsable",
      "tipo": "unidad",
      "requerido": true,
      "orden": 6
    },
    {
      "nombre": "numero_funcionarios",
      "etiqueta": "N° de Funcionarios Participantes",
      "tipo": "number",
      "requerido": true,
      "orden": 7
    },
    {
      "nombre": "vehiculos_utilizados",
      "etiqueta": "¿Se utilizaron vehículos?",
      "tipo": "checkbox",
      "requerido": false,
      "opciones": "Móvil policial,Motocicleta,Vehículo particular,Sin vehículos",
      "orden": 8
    },
    {
      "nombre": "resultados",
      "etiqueta": "Resultados del Operativo",
      "tipo": "textarea",
      "requerido": true,
      "orden": 9
    },
    {
      "nombre": "documentos_adjuntos",
      "etiqueta": "Documentos de Respaldo",
      "tipo": "file",
      "requerido": false,
      "tiposPermitidos": ".pdf,.jpg,.png,.doc",
      "orden": 10
    },
    {
      "nombre": "evaluacion_operativo",
      "etiqueta": "Evaluación del Operativo (1-5)",
      "tipo": "scale",
      "requerido": false,
      "min": 1,
      "max": 5,
      "orden": 11
    }
  ]
}
```

### Respuesta guardada:
```json
{
  "formularioId": 123,
  "idFuncionario": 456,
  "idUnidad": 789,
  "fechaRespuesta": "2025-01-14T15:30:00",
  "datos": {
    "fecha_operativo": "2025-01-14",
    "hora_inicio": "14:00",
    "hora_termino": "18:00",
    "tipo_operativo": "Control vehicular",
    "jefe_operativo": { "idFun": 101, "label": "Juan Pérez" },
    "unidad_responsable": { "idUnidad": 789, "label": "DIPOL" },
    "numero_funcionarios": 8,
    "vehiculos_utilizados": ["Móvil policial", "Motocicleta"],
    "resultados": "Se realizaron 45 controles vehiculares...",
    "documentos_adjuntos": "archivo_12345.pdf",
    "evaluacion_operativo": 4
  }
}
```

## 🔧 Tips para el Backend

### 1. Validación de tipos
```java
public void validarDatos(Map<String, Object> datos, List<FormularioCampo> campos) {
    for (FormularioCampo campo : campos) {
        Object valor = datos.get(campo.getNombre());

        if (campo.getRequerido() && valor == null) {
            throw new ValidationException(campo.getEtiqueta() + " es requerido");
        }

        // Validar tipo según campo.getTipo()
        switch (campo.getTipo()) {
            case "number":
                if (!(valor instanceof Number)) {
                    throw new ValidationException(campo.getEtiqueta() + " debe ser numérico");
                }
                break;
            case "email":
                if (!valor.toString().matches("^[^@]+@[^@]+\\.[^@]+$")) {
                    throw new ValidationException(campo.getEtiqueta() + " debe ser email válido");
                }
                break;
            // ... más validaciones
        }
    }
}
```

### 2. Extracción type-safe
```java
public class FormularioDataExtractor {

    public static String getString(Map<String, Object> datos, String campo) {
        Object valor = datos.get(campo);
        return valor != null ? valor.toString() : null;
    }

    public static Integer getInteger(Map<String, Object> datos, String campo) {
        Object valor = datos.get(campo);
        if (valor instanceof Number) {
            return ((Number) valor).intValue();
        }
        return null;
    }

    public static LocalDate getDate(Map<String, Object> datos, String campo) {
        String valor = getString(datos, campo);
        return valor != null ? LocalDate.parse(valor) : null;
    }
}

// Uso:
String email = FormularioDataExtractor.getString(datos, "email_contacto");
Integer numFunc = FormularioDataExtractor.getInteger(datos, "numero_funcionarios");
LocalDate fecha = FormularioDataExtractor.getDate(datos, "fecha_servicio");
```

---

**Última actualización:** 2025-01-14
