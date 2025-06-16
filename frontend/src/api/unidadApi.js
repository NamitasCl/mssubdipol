import axios from "axios";
const API_UNIDAD = "http://localhost:8011/api/common/unidades/buscar";

export async function buscarUnidadesPorNombre(nombre) {
    const res = await axios.get(API_UNIDAD, { params: { nombre } });
    return res.data.map(u => ({
        value: u.idUnidad,
        label: `${u.siglasUnidad} - ${u.nombreUnidad} (${u.nombreComuna})`,
        ...u
    }));
}

export async function buscarUnidadPorId(id) {
    const res = await axios.get(API_UNIDAD, { params: { idUnidad: id } });
    if (res.data.length === 0) return null;
    return res.data;
}