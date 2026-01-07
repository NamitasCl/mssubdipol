import React, {useState} from 'react';
import AsyncSelect from 'react-select/async';
// 1. Ya no importamos el CSS Module
import HeaderMasivos from "./HeaderMasivos.jsx";
import {Card, Container} from "react-bootstrap";

// --- Funciones de Validación (Módulo 11) ---
// ... (Esta lógica no cambia en absoluto)
const normalizeRut = (rut) => {
    if (!rut) return {numero: '', dv: ''};
    let rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutLimpio.length === 0) return {numero: '', dv: ''};
    let dv = rutLimpio.slice(-1);
    let numero = rutLimpio.slice(0, -1);
    return {numero, dv};
};

const validarRut = (rut) => {
    const {numero, dv} = normalizeRut(rut);
    if (!numero || !dv) return false;
    let M = 0, S = 1;
    for (let i = numero.length - 1; i >= 0; i--) {
        S = (S + (numero.charAt(i) * (M % 6 + 2))) % 11;
        M++;
    }
    const dvCalculado = S > 0 ? String(11 - S) : '0';
    const dvEsperado = dvCalculado === '10' ? 'K' : dvCalculado;
    return dvEsperado === dv;
};

// --- Función para Cargar Opciones (API) ---
// ... (Esta lógica no cambia)
const createLoadOptions = (endpointUrl) => async (inputValue, callback) => {
    try {
        if (inputValue.length < 2) return callback([]);
        const response = await fetch(`${endpointUrl}?search=${encodeURIComponent(inputValue)}`);
        const data = await response.json();
        const options = data.map(item => ({
            value: item.id,
            label: item.nombre
        }));
        callback(options);
    } catch (error) {
        console.error(`Error cargando datos desde ${endpointUrl}:`, error);
        callback([]);
    }
};

// --- Instancias de cargadores ---
// ... (Esta lógica no cambia)
const loadComunas = createLoadOptions('/api/comunas');
const loadNacionalidades = createLoadOptions('/api/nacionalidades');
const loadCalidadPersona = createLoadOptions('/api/calidad-persona');
const loadCondicionPersona = createLoadOptions('/api/condicion-persona');
const loadGenero = createLoadOptions('/api/generos');
const loadSituacionMigratoria = createLoadOptions('/api/situacion-migratoria');
const loadDelitos = createLoadOptions('/api/delitos');


// --- Componente Principal ---

function FormularioDetencion() {
    const [formData, setFormData] = useState({
        fechaDetencion: '',
        comunaDetencion: null,
        calidadPersona: null,
        condicionPersona: null,
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        genero: null,
        edad: '',
        nacionalidad: null,
        cedula: '',
        situacionMigratorIA: null,
        delito: null,
    });

    const [rutError, setRutError] = useState('');

    // ... (Todos los handlers: handleChange, handleRutChange, handleSelectChange, handleSubmit)
    // ... (Son exactamente iguales a tu código original, no necesitan cambios)
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleRutChange = (e) => {
        const {value} = e.target;
        setFormData(prev => ({...prev, cedula: value}));
        if (value.length > 0 && !validarRut(value)) {
            setRutError('La cédula de identidad no es válida.');
        } else {
            setRutError('');
        }
    };

    const handleSelectChange = (name) => (selectedOption) => {
        setFormData(prev => ({...prev, [name]: selectedOption}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validarRut(formData.cedula)) {
            setRutError('La cédula de identidad no es válida.');
            alert('Por favor, corrige la cédula de identidad.');
            return;
        }
        const dataParaEnviar = {
            ...formData,
            comunaDetencion: formData.comunaDetencion?.value || null,
            calidadPersona: formData.calidadPersona?.value || null,
            condicionPersona: formData.condicionPersona?.value || null,
            genero: formData.genero?.value || null,
            nacionalidad: formData.nacionalidad?.value || null,
            situacionMigratoria: formData.situacionMigratoria?.value || null,
            delito: formData.delito?.value || null,
        };
        console.log('Datos del formulario listos para enviar:', dataParaEnviar);
        alert('Formulario enviado (revisar consola)');
    };


    // 2. Aquí aplicamos las clases de Bootstrap
    return (
        <div>
            <HeaderMasivos />

            <Container>
                <Card>
                    <div className="card-body p-4 p-md-5">

                        <h2 className="text-center mb-4 h3">Formulario de Detención</h2>

                        <form onSubmit={handleSubmit}>

                            {/* --- Fila para Datos Personales (Grid de 3 columnas) --- */}
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="nombres" className="form-label">Nombres:</label>
                                        <input
                                            type="text"
                                            id="nombres"
                                            name="nombres"
                                            value={formData.nombres}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="apellidoPaterno" className="form-label">Apellido
                                            Paterno:</label>
                                        <input
                                            type="text"
                                            id="apellidoPaterno"
                                            name="apellidoPaterno"
                                            value={formData.apellidoPaterno}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="apellidoMaterno" className="form-label">Apellido
                                            Materno:</label>
                                        <input
                                            type="text"
                                            id="apellidoMaterno"
                                            name="apellidoMaterno"
                                            value={formData.apellidoMaterno}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- Fila para Identificación (Grid de 3 columnas) --- */}
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="cedula" className="form-label">Cédula de Identidad
                                            (RUT):</label>
                                        <input
                                            type="text"
                                            id="cedula"
                                            name="cedula"
                                            placeholder="Ej: 12345678-9"
                                            value={formData.cedula}
                                            onChange={handleRutChange}
                                            required
                                            // Asignación condicional de clases Bootstrap para validación
                                            className={`form-control ${rutError ? 'is-invalid' : ''}`}
                                        />
                                        {/* Mensaje de error de Bootstrap */}
                                        {rutError && <div className="invalid-feedback">{rutError}</div>}
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="nacionalidad" className="form-label">Nacionalidad:</label>
                                        <AsyncSelect
                                            id="nacionalidad"
                                            name="nacionalidad"
                                            value={formData.nacionalidad}
                                            onChange={handleSelectChange('nacionalidad')}
                                            loadOptions={loadNacionalidades}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="genero" className="form-label">Género:</label>
                                        <AsyncSelect
                                            id="genero"
                                            name="genero"
                                            value={formData.genero}
                                            onChange={handleSelectChange('genero')}
                                            loadOptions={loadGenero}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- Fila para Contexto (Grid de 2 columnas) --- */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="fechaDetencion" className="form-label">Fecha Detención:</label>
                                        <input
                                            type="date"
                                            id="fechaDetencion"
                                            name="fechaDetencion"
                                            value={formData.fechaDetencion}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="edad" className="form-label">Edad:</label>
                                        <input
                                            type="number"
                                            id="edad"
                                            name="edad"
                                            value={formData.edad}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- Fila para Listas (Grid de 2 columnas) --- */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="comunaDetencion" className="form-label">Comuna
                                            Detención:</label>
                                        <AsyncSelect
                                            id="comunaDetencion"
                                            name="comunaDetencion"
                                            value={formData.comunaDetencion}
                                            onChange={handleSelectChange('comunaDetencion')}
                                            loadOptions={loadComunas}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar comuna..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="situacionMigratoria" className="form-label">Situación
                                            Migratoria:</label>
                                        <AsyncSelect
                                            id="situacionMigratoria"
                                            name="situacionMigratoria"
                                            value={formData.situacionMigratoria}
                                            onChange={handleSelectChange('situacionMigratoria')}
                                            loadOptions={loadSituacionMigratoria}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar situación..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* --- Fila para Clasificación (Grid de 3 columnas) --- */}
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="calidadPersona" className="form-label">Calidad de la
                                            Persona:</label>
                                        <AsyncSelect
                                            id="calidadPersona"
                                            name="calidadPersona"
                                            value={formData.calidadPersona}
                                            onChange={handleSelectChange('calidadPersona')}
                                            loadOptions={loadCalidadPersona}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar calidad..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="condicionPersona" className="form-label">Condición de la
                                            Persona:</label>
                                        <AsyncSelect
                                            id="condicionPersona"
                                            name="condicionPersona"
                                            value={formData.condicionPersona}
                                            onChange={handleSelectChange('condicionPersona')}
                                            loadOptions={loadCondicionPersona}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar condición..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="delito" className="form-label">Delito:</label>
                                        <AsyncSelect
                                            id="delito"
                                            name="delito"
                                            value={formData.delito}
                                            onChange={handleSelectChange('delito')}
                                            loadOptions={loadDelitos}
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            placeholder="Buscar delito..."
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- Botón de Envío --- */}
                            <button type="submit" className="btn btn-primary w-100 btn-lg mt-4">
                                Guardar Detención
                            </button>
                        </form>
                    </div>
                </Card>
            </Container>
        </div>
    );
}

export default FormularioDetencion;