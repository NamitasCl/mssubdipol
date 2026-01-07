# Sistema de Formularios V2

Sistema completo de gestión de formularios dinámicos con interfaz moderna, drag & drop, y gestión de permisos y cuotas.

## 📋 Características

### ✅ Funcionalidades Implementadas

- **Dashboard Principal**: Vista organizada por categorías (Mis Formularios, Asignados a Mí, Mi Unidad, Públicos)
- **Constructor de Formularios**: Editor visual con drag & drop para crear y editar formularios
- **15 Tipos de Campos**: Texto, textarea, número, email, teléfono, fecha, hora, select, radio, checkbox, escala, archivo, funcionario, unidad
- **Sistema de Permisos**: Control granular de visibilidad (pública, por unidad, por usuario, por grupo)
- **Gestión de Cuotas**: Asignación de cuotas de respuestas a unidades o funcionarios específicos
- **Límites de Respuestas**: Control del total máximo de respuestas por formulario
- **Acciones sobre Formularios**: Ver, editar, duplicar, activar/desactivar, eliminar
- **Diseño Moderno**: Interfaz profesional e intuitiva con animaciones y estados visuales

### 🎨 Componentes

```
formulariosv2/
├── FormulariosV2Page.jsx          # Componente principal y dashboard
├── mockData.js                     # Datos de prueba (fáciles de eliminar)
└── components/
    ├── FormulariosList.jsx         # Lista de formularios con tarjetas
    ├── FormularioBuilder.jsx       # Constructor con tabs y drag & drop
    ├── FormFieldPalette.jsx        # Paleta de tipos de campos
    ├── PermissionsManager.jsx      # Gestor de permisos y visibilidad
    └── QuotasManager.jsx           # Gestor de cuotas y límites
```

## 🚀 Uso

### Integración en la Aplicación

```jsx
import FormulariosV2Page from "./pages/formulariosv2/FormulariosV2Page";

// En tu router
<Route path="/formularios-v2" element={<FormulariosV2Page />} />
```

### Crear un Formulario

1. Click en "Nuevo Formulario"
2. **Tab General**: Define nombre, descripción y límite de respuestas
3. **Tab Campos**: Arrastra campos desde la paleta o haz click en ellos
   - Configura etiquetas, tipos y opciones
   - Reordena con drag & drop
   - Duplica o elimina campos
4. **Tab Permisos**: Define quién puede ver y completar el formulario
5. **Tab Cuotas** (opcional): Asigna cuotas específicas a unidades o funcionarios
6. Click en "Guardar Formulario"

### Gestionar Formularios

- **Ver**: Abre la vista de detalles y respuestas
- **Editar**: Modifica la estructura del formulario
- **Duplicar**: Crea una copia del formulario
- **Activar/Desactivar**: Controla si el formulario está disponible
- **Eliminar**: Borra el formulario (con confirmación)

## 🔌 Integración con API

Los datos mock están en `mockData.js`. Para conectar con tu API:

### 1. Limpiar datos mock

```javascript
import { clearMockData } from "./mockData";
clearMockData(); // Imprime mensaje en consola
```

### 2. Reemplazar funciones en FormulariosV2Page.jsx

```javascript
// Reemplazar:
const [formularios, setFormularios] = useState(MOCK_FORMULARIOS);

// Por:
const [formularios, setFormularios] = useState([]);

useEffect(() => {
    // Cargar desde API
    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
        headers: { Authorization: `Bearer ${user?.token}` }
    })
    .then(res => res.json())
    .then(data => setFormularios(data));
}, []);
```

### 3. Endpoints necesarios

```javascript
// GET /api/formularios/dinamico/definicion
// Listar todos los formularios

// GET /api/formularios/dinamico/definicion/:id
// Obtener un formulario específico

// POST /api/formularios/dinamico/definicion
// Crear nuevo formulario
// Body: { nombre, descripcion, campos, visibilidad, limiteRespuestas, cuotas }

// PUT /api/formularios/dinamico/definicion/:id
// Actualizar formulario

// DELETE /api/formularios/dinamico/definicion/:id
// Eliminar formulario

// PUT /api/formularios/dinamico/definicion/:id/estado
// Cambiar estado (activo/inactivo)
```

## 📊 Estructura de Datos

### Formulario

```typescript
{
  id: number,
  nombre: string,
  descripcion: string,
  creadorId: number,
  creadorNombre: string,
  unidadCreador: string,
  fechaCreacion: string (ISO),
  estado: "activo" | "inactivo",
  totalRespuestas: number,
  limiteRespuestas: number | null,
  visibilidad: VisibilidadRegla[],
  cuotas: Cuota[],
  campos: Campo[]
}
```

### Campo

```typescript
{
  id: string,
  tipo: string,
  etiqueta: string,
  requerido: boolean,
  opciones?: string[], // Para select, radio, checkbox
  min?: number,        // Para scale
  max?: number,        // Para scale
  tiposPermitidos?: string // Para file
}
```

### Visibilidad

```typescript
{
  tipo: "publica" | "unidad" | "usuario" | "grupo",
  valor: string | null,
  nombre: string
}
```

### Cuota

```typescript
{
  tipo: "unidad" | "usuario",
  valor: string,
  nombre: string,
  cantidad: number,
  completadas: number
}
```

## 🎯 Console Logs

Todos los eventos importantes están registrados en consola para facilitar debugging:

- `📝 Crear nuevo formulario`
- `✏️ Editar formulario: {id}`
- `👁️ Ver formulario: {id}`
- `📋 Duplicar formulario: {id}`
- `🗑️ Eliminar formulario: {id}`
- `🔄 Cambiar estado formulario: {id}`
- `💾 Guardar formulario: {data}`
- `➕ Agregar campo: {tipo}`
- `🎨 Campo seleccionado desde paleta: {tipo}`
- `➕ Agregar regla de visibilidad: {regla}`
- `➕ Agregar cuota: {cuota}`

## 🎨 Personalización

### Colores

Los colores principales están definidos inline y pueden ser extraídos a variables CSS:

- Color primario: `#17355A`
- Background: `#f8f9fa`
- Bordes: `#e9ecef`, `#dee2e6`

### Iconos

Se usan Bootstrap Icons. Puedes cambiarlos modificando las clases `bi-*`.

### Animaciones

Las animaciones están en los eventos `onMouseEnter` y `onMouseLeave`. Puedes ajustar:
- `transform`
- `boxShadow`
- `transition`

## ✅ Dependencias

- React
- React Bootstrap
- @hello-pangea/dnd (drag & drop)
- date-fns (formateo de fechas)
- Bootstrap Icons

## 🔒 Permisos

El sistema usa `useAuth()` para obtener datos del usuario:

```javascript
const { user } = useAuth();
// user.idFuncionario
// user.siglasUnidad
// user.nombreFun
// user.apellidoPaternoFun
```

## 📝 Notas

- Los datos mock se pueden eliminar fácilmente usando `clearMockData()`
- Todos los console.log facilitan el debugging
- El diseño es responsive y mobile-friendly
- Los formularios se categorizan automáticamente según permisos
- Las validaciones están implementadas en el frontend (agregar también en backend)

## 🚧 Próximas Mejoras Sugeridas

- [ ] Vista previa del formulario antes de guardar
- [ ] Importar/Exportar formularios (JSON)
- [ ] Plantillas de formularios
- [ ] Validaciones avanzadas por campo (regex, rangos, etc.)
- [ ] Lógica condicional (mostrar campos según respuestas)
- [ ] Secciones/páginas múltiples
- [ ] Análisis y reportes de respuestas
- [ ] Exportación de respuestas (CSV, Excel)
- [ ] Notificaciones por email
- [ ] Historial de versiones

---

**Desarrollado con ❤️ para el sistema de gestión policial**
