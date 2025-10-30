import React, {useEffect} from 'react';
import * as XLSX from 'xlsx';
import axios from "axios";

/**
 * Componente que renderiza una tabla de FichaPersonaDTO y permite exportarla.
 * @param {{fichas: Array<Object>}} props - Un array de objetos FichaPersonaDTO.
 */
const TablaJose = () => {

    const [fichas, setFichas] = React.useState([]);
    const [fechaVisualizar, setFechaVisualizar] = React.useState(null);

    const API_URL = "http://localhost:8013/api/nodos/servicios-especiales/personas";

    useEffect(() => {
        const getFichas = async () => {
            try {
                const response = await axios.get(API_URL);
                setFichas(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error al obtener las fichas:", error);
            }
        }

        getFichas();
    }, []);


    // --- SECCIÓN DE HELPERS ---

    /**
     * Helper para aplanar un array (que viene de un Set) en un string.
     * @param {string[]} arr - El array de strings (ej: ["Robo", "Hurto"]).
     * @returns {string} - Un string (ej: "Robo, Hurto") o "N/A" si está vacío.
     */
    const aplanarSet = (arr) => {
        if (!arr || arr.length === 0) {
            return 'N/A';
        }
        return arr.join(', ');
    };

    /**
     * Helper para formatear fechas (OffsetDateTime) a un formato legible.
     * @param {string} fechaString - El string de la fecha (ISO 8601)
     * @returns {string} - La fecha formateada (ej: 28/10/2025 14:30:00)
     */
    const formatFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            // new Date() puede interpretar OffsetDateTime sin problemas
            const fecha = new Date(fechaString).toLocaleString("es-Cl");
            return fecha.replace(",", "");
        } catch (e) {
            return fechaString; // Devuelve el string original si falla
        }
    };


    // --- SECCIÓN DE LÓGICA DE EXPORTACIÓN ---

    /**
     * Manejador del clic del botón para exportar a Excel.
     */
    const handleExportar = () => {
        // 1. Mapeamos los datos al formato deseado para Excel
        //    (Aquí sí incluimos TODOS los campos del DTO)
        const datosParaExcel = fichas.map(ficha => ({
            "ID": ficha.id,
            "RUT": ficha.rut,
            "Nombre": ficha.nombre,
            "Apellido Paterno": ficha.apellidoPat,
            "Apellido Materno": ficha.apellidoMat,
            "Delitos": aplanarSet(ficha.delitosNombres),
            "Estados": aplanarSet(ficha.estadosNombres),
            "Nacionalidad": ficha.nacionalidadNombre,
            "Edad": ficha.edad,
            "Sexo": ficha.sexo,
            "Memo ID": ficha.memoId,
            "Fecha Creación": new Date(ficha.createdAt),
            "Fecha Hecho": new Date(ficha.fechaHecho),
            "Fecha Memo": new Date(ficha.fechaRegistroMemo),
            "Dirección": `${ficha.direccion || ''} ${ficha.direccionNumero || ''}`.trim(),
            "Departamento": ficha.departamento,
            "Block": ficha.block,
            "Cond. Migratoria": ficha.condicionMigratoria,
            "Apodo": ficha.apodo,
            "Ciudad Nacimiento": ficha.ciudadNacimiento,
            "Fono": ficha.fono,
            "Email": ficha.correoElectronico,
            "Observaciones": ficha.observaciones,
            //"Tipo de diligencia": ficha.tipoDiligencia,
        }));

        // 2. Creamos la hoja de cálculo (Worksheet)
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);

        // 3. Creamos el libro (Workbook) y añadimos la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FichasPersonas"); // "FichasPersonas" es el nombre de la pestaña

        // 4. Generamos el archivo y disparamos la descarga
        XLSX.writeFile(wb, "reporte_fichas_persona.xlsx");
    };


    // --- SECCIÓN DE RENDERIZADO (JSX) ---

    // Estilos básicos para la tabla (opcional)
    const styles = {
        tabla: {width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '0.9rem'},
        th: {border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4', textAlign: 'left'},
        td: {border: '1px solid #ddd', padding: '8px', verticalAlign: 'top'},
        boton: {
            marginTop: '15px',
            marginLeft: '10px',
            marginBottom: '10px',
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
        }
    };

    if (!fichas || fichas.length === 0) {
        return <p>No hay fichas para mostrar.</p>;
    }

    return (
        <div>
            <button onClick={handleExportar} style={styles.boton}>
                Exportar a Excel
            </button>

            {/*<table style={styles.tabla}>
                <thead>
                <tr>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Nombre Completo</th>
                    <th style={styles.th}>Edad</th>
                    <th style={styles.th}>Delitos</th>
                    <th style={styles.th}>Estados</th>
                    <th style={styles.th}>Nacionalidad</th>
                    <th style={styles.th}>Memo ID</th>
                    <th style={styles.th}>Sexo</th>
                    <th style={styles.th}>Tipo Diligencia</th>
                    <th style={styles.th}>Fecha Hecho</th>
                </tr>
                </thead>
                <tbody>
                {fichas.map((ficha) => (
                    <tr key={`${ficha.memoId}+${Date.now() + Math.random() * 1000}`}>
                        <td style={styles.td}>{ficha.rut}</td>
                        <td style={styles.td}>{`${ficha.nombre} ${ficha.apellidoPat} ${ficha.apellidoMat}`}</td>
                        <td style={styles.td}>{ficha.edad}</td>
                        <td style={styles.td}>{aplanarSet(ficha.delitosNombres)}</td>
                        <td style={styles.td}>{aplanarSet(ficha.estadosNombres)}</td>
                        <td style={styles.td}>{ficha.nacionalidadNombre}</td>
                        <td style={styles.td}>{ficha.memoId}</td>
                        <td style={styles.td}>{ficha.sexo}</td>
                        <td style={styles.td}>{ficha.tipoDiligencia}</td>
                        <td style={styles.td}>{formatFecha(ficha.fechaHecho)}</td>
                    </tr>
                ))}
                </tbody>
            </table>*/}
        </div>
    );
};

export default TablaJose;