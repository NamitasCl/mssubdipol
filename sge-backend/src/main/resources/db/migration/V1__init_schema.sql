-- 1. Entities

CREATE TABLE IF NOT EXISTS evento (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(255),
    tipo VARCHAR(255),
    region VARCHAR(255),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    radio DOUBLE PRECISION,
    fecha TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS provisiones (
    id BIGSERIAL PRIMARY KEY,
    litros_agua INTEGER,
    raciones_comida INTEGER,
    autonomia_horas INTEGER
);

CREATE TABLE IF NOT EXISTS requerimiento_regional (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT REFERENCES evento(id),
    region VARCHAR(255),
    cantidad_funcionarios INTEGER,
    cantidad_vehiculos INTEGER
);

CREATE TABLE IF NOT EXISTS despliegue (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT REFERENCES evento(id),
    provisiones_id BIGINT UNIQUE REFERENCES provisiones(id),
    descripcion VARCHAR(255),
    encargado VARCHAR(255),
    instrucciones TEXT,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    cantidad_funcionarios_requeridos INTEGER,
    cantidad_vehiculos_requeridos INTEGER,
    fecha_solicitud TIMESTAMP WITHOUT TIME ZONE,
    fecha_inicio TIMESTAMP WITHOUT TIME ZONE,
    fecha_termino TIMESTAMP WITHOUT TIME ZONE,
    numero_prorrogas INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS funcionario (
    rut VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255),
    grado VARCHAR(255),
    unidad VARCHAR(255),
    subdireccion VARCHAR(255),
    region VARCHAR(255),
    region_policial VARCHAR(255),
    telefono VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS funcionario_especialidades (
    funcionario_rut VARCHAR(255) NOT NULL,
    especialidades VARCHAR(255),
    FOREIGN KEY (funcionario_rut) REFERENCES funcionario(rut)
);

CREATE TABLE IF NOT EXISTS vehiculo (
    sigla VARCHAR(255) PRIMARY KEY,
    tipo VARCHAR(255),
    capacidad INTEGER,
    estado VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS recurso (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    tipo VARCHAR(255),
    estado VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS insumo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    tipo VARCHAR(255),
    cantidad INTEGER,
    unidad VARCHAR(255),
    fecha_vencimiento DATE
);

CREATE TABLE IF NOT EXISTS asignacion (
    id BIGSERIAL PRIMARY KEY,
    despliegue_id BIGINT REFERENCES despliegue(id),
    vehiculo_sigla VARCHAR(255) REFERENCES vehiculo(sigla),
    recurso_id BIGINT REFERENCES recurso(id),
    insumo_id BIGINT REFERENCES insumo(id),
    cantidad_asignada INTEGER,
    unidad_origen VARCHAR(255),
    fecha_asignacion TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS asignacion_funcionarios (
    asignacion_id BIGINT NOT NULL,
    funcionario_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (asignacion_id) REFERENCES asignacion(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionario(rut)
);
