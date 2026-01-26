const crypto = require('crypto');

// Configuration
const API_URL = "http://sge-backend:8080/api";
const SECRET_KEY = "577b64079224274ecb0eaba23002e415b1979018982b872a977a6b2975a3c8895945ee168bf0aaa5de2ed36b2767e5cfb6bf92a2e177ac6e787c65de3bda71a8f74a732e2cc9ab06f54d8daec810e2d3b38048f1a69f8a8c34914ac594e978ffc4a224586ef19c50763c8017890cb7b94e9414d3b313ede7aa0747e18b1a8d0b25f65b8f9d881807ddbca4a92bdc84378e584732edde2602d52c33e66e69172216e896d8b4556b2bcc08dea115cdfe4279100a71bf8ba0413226c036fdb68b1a8246cbb515d39ab9550e5911c6852cb131d5423cf7b2e76ba9d9e2040b39551d3d9eb45aa5e873b7060a27aa4a79748ca2610b0257c933297c988a64e46e6f84";

function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateToken() {
    const header = { alg: "HS512", typ: "JWT" };
    // Payload matching JwtFilter expectations
    const payload = {
        sub: "admin",
        roles: ["ADMINISTRADOR", "PM_SUB", "JEFE", "ROLE_ADMINISTRADOR"],
        nombreUsuario: "Administrador Sistema",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
    };

    const headerEnc = base64UrlEncode(JSON.stringify(header));
    const payloadEnc = base64UrlEncode(JSON.stringify(payload));
    const data = `${headerEnc}.${payloadEnc}`;

    // Sign using HS512 with the secret key string (treated as utf8 bytes by default in crypto)
    const signature = crypto.createHmac('sha512', SECRET_KEY)
        .update(data)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `${data}.${signature}`;
}

const TOKEN = generateToken();
const HEADERS = {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
};

async function post(endpoint, data) {
    console.log(`POST ${endpoint}...`);
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const txt = await res.text();
            console.error(`FAILED ${endpoint}: Status ${res.status}`);
            console.error(`Response: ${txt}`);
            return null;
        }
        try {
            const json = await res.json();
            console.log(`SUCCESS ${endpoint}`);
            return json;
        } catch (e) {
            return {};
        }
    } catch (e) {
        console.error(`NETWORK ERROR ${endpoint}:`, e.message);
        return null;
    }
}

async function main() {
    // Helper for local datetime (yyyy-MM-dd'T'HH:mm:ss)
    const now = new Date().toISOString().slice(0, 19);

    console.log("--- STARTING SEED ---");

    // 1. Create Event
    const eventPayload = {
        descripcion: "MEGA INCENDIO FORESTAL BIOBIO Y ÑUBLE",
        tipo: "INCENDIO",
        estado: "ACTIVO",
        latitud: -36.8270,
        longitud: -73.0503,
        fecha: now,
        regiones: ["BIOBIO", "ÑUBLE"],
        radio: 50000,
        zonaAfectada: JSON.stringify({
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-73.1, -36.8], [-73.0, -36.8],
                    [-73.0, -36.9], [-73.1, -36.9],
                    [-73.1, -36.8]
                ]]
            }
        })
    };

    const eventRes = await post('/eventos', eventPayload);
    if (!eventRes) return;
    const eventId = eventRes.id;

    // 2. Report Availability
    const units = [
        { u: "BRIGADA HOMICIDIOS CONCEPCION", r: "REGION DEL BIOBIO", f: 15, v: 8, o: "Equipo completo disponible", eq: ["Kit Sitio Suceso", "Luces Forenses"] },
        { u: "BRIGADA ANTINARCOTICOS CHILLAN", r: "REGION DE ÑUBLE", f: 12, v: 6, o: "Vehículos 4x4 operativos", eq: ["Dron Térmico"] },
        { u: "BRIGADA INVESTIGADORA DELITOS ECONOMICOS", r: "REGION DEL BIOBIO", f: 8, v: 4, o: "Personal de apoyo administrativo", eq: ["Computadores", "Impresoras"] },
        { u: "BRIGADA ADIESTRAMIENTO CANINO ZONA SUR", r: "JEFATURA NACIONAL DE U. ESPECIALIZADAS", f: 10, v: 8, o: "10 binomios caninos (Búsqueda cadáveres)", eq: ["Caniles", "Arneses"] },
        { u: "LACRIM REGIONAL CONCEPCION", r: "REGION DEL BIOBIO", f: 8, v: 4, o: "Peritos Huellográficos y Fotográficos", eq: ["Cámaras", "Reactivos"] },
        { u: "PREFECTURA PROVINCIAL CONCEPCION", r: "REGION DEL BIOBIO", f: 10, v: 5, o: "Mando y control", eq: ["Carpas Mando", "Generador"] }
    ];

    const availList = [];
    for (const u of units) {
        const payload = {
            unidad: u.u,
            regionOJefatura: u.r,
            funcionariosDisponibles: u.f,
            vehiculosDisponibles: u.v,
            observaciones: u.o,
            fechaReporte: now,
            equiposDisponibles: JSON.stringify(u.eq)
        };
        const res = await post('/disponibilidad', payload);
        if (res) availList.push(res);
        await new Promise(r => setTimeout(r, 100)); // Pacing
    }

    // 3. Create Inventory
    const items = [
        { nombre: "RACIÓN DE COMBATE", unidad: "UNIDADES", cantidad: 5000, categoria: "ALIMENTACION" },
        { nombre: "AGUA POTABLE", unidad: "LITROS", cantidad: 10000, categoria: "HIDRATACION" },
        { nombre: "EQUIPO FORENSE", unidad: "KIT", cantidad: 50, categoria: "CRIMINALISTICA" },
        { nombre: "CANIL MÓVIL", unidad: "UNIDAD", cantidad: 20, categoria: "INFRAESTRUCTURA" }
    ];
    for (const item of items) {
        await post('/insumos', item);
    }

    // 4. Create Deployment
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);

    const deployPayload = {
        descripcion: "DESPLIEGUE OPERATIVO ZONA CERO",
        encargado: "PREFECTO INSPECTOR ROJAS",
        instrucciones: "Control de perímetro, levantamiento de pericias en zonas siniestradas, apoyo con ejemplares caninos para búsqueda.",
        latitud: -36.8270,
        longitud: -73.0503,
        cantidadFuncionariosRequeridos: 50,
        cantidadVehiculosRequeridos: 30,
        fechaSolicitud: now,
        fechaInicio: now,
        fechaTermino: nextWeek
    };

    const deployRes = await post(`/eventos/${eventId}/despliegues`, deployPayload);
    if (!deployRes) return;
    const deployId = deployRes.id;

    // 5. Create Requests (Solicitudes)
    const targetFunc = 50;
    const targetVeh = 30;

    let curFunc = 0;
    let curVeh = 0;

    for (const av of availList) {
        if (curFunc >= targetFunc && curVeh >= targetVeh) break;

        const askFunc = Math.min(av.funcionariosDisponibles, targetFunc - curFunc);
        const askVeh = Math.min(av.vehiculosDisponibles, targetVeh - curVeh);

        if (askFunc > 0 || askVeh > 0) {
            const solPayload = {
                despliegue: { id: deployId },
                regionDestino: av.regionOJefatura,
                unidadDestino: av.unidad,
                funcionariosRequeridos: askFunc,
                vehiculosRequeridos: askVeh,
                estado: "PENDIENTE",
                instrucciones: "Despliegue inmediato."
            };
            await post('/solicitudes', solPayload);
            curFunc += askFunc;
            curVeh += askVeh;
        }
    }

    console.log("--- SEED COMPLETE ---");
}

main();
