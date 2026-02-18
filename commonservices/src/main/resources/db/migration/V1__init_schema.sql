CREATE TABLE IF NOT EXISTS funcionarios (
    id BIGSERIAL PRIMARY KEY,
    id_fun INTEGER NOT NULL UNIQUE,
    nombre_fun VARCHAR(255),
    apellido_paterno_fun VARCHAR(255),
    apellido_materno_fun VARCHAR(255),
    siglas_cargo VARCHAR(255),
    nombre_cargo VARCHAR(255),
    nombre_unidad VARCHAR(255),
    siglas_unidad VARCHAR(255),
    username VARCHAR(255),
    antiguedad INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comuna (
    id BIGSERIAL PRIMARY KEY,
    nombre_comuna VARCHAR(255),
    provincia_id BIGINT
);

CREATE TABLE IF NOT EXISTS region (
    id BIGSERIAL PRIMARY KEY,
    nombre_region VARCHAR(255),
    romano VARCHAR(255),
    numero INTEGER NOT NULL,
    abreviatura VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS delito (
    id BIGSERIAL PRIMARY KEY,
    nombre_delito VARCHAR(255),
    familia_delito VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS provincia (
    id BIGSERIAL PRIMARY KEY,
    nombre_provincia VARCHAR(255),
    region_id BIGINT
);

CREATE TABLE IF NOT EXISTS unidades (
    id BIGSERIAL PRIMARY KEY,
    nombre_unidad VARCHAR(255),
    siglas_unidad VARCHAR(255),
    region_id BIGINT,
    comuna_id BIGINT
);
