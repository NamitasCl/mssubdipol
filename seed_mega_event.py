import requests
import jwt
import datetime
import time
import json

# Configuration
API_URL = "http://localhost:8080/api"
SECRET_KEY = "577b64079224274ecb0eaba23002e415b1979018982b872a977a6b2975a3c8895945ee168bf0aaa5de2ed36b2767e5cfb6bf92a2e177ac6e787c65de3bda71a8f74a732e2cc9ab06f54d8daec810e2d3b38048f1a69f8a8c34914ac594e978ffc4a224586ef19c50763c8017890cb7b94e9414d3b313ede7aa0747e18b1a8d0b25f65b8f9d881807ddbca4a92bdc84378e584732edde2602d52c33e66e69172216e896d8b4556b2bcc08dea115cdfe4279100a71bf8ba0413226c036fdb68b1a8246cbb515d39ab9550e5911c6852cb131d5423cf7b2e76ba9d9e2040b39551d3d9eb45aa5e873b7060a27aa4a79748ca2610b0257c933297c988a64e46e6f84"

def generate_token():
    payload = {
        "sub": "admin",
        "roles": ["ADMINISTRADOR", "PM_SUB", "JEFE"],
        "nombreUsuario": "Administrador Sistema",
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS512")

TOKEN = generate_token()
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def create_event():
    print("Creating Event...")
    payload = {
        "descripcion": "MEGA INCENDIO FORESTAL BIOBIO Y ÑUBLE",
        "tipo": "INCENDIO",
        "estado": "ACTIVO",
        "latitud": -36.8270, # Concepción area
        "longitud": -73.0503,
        "fecha": datetime.datetime.now().isoformat(),
        "regiones": ["BIOBIO", "ÑUBLE"],
        "radio": 50000
    }
    res = requests.post(f"{API_URL}/eventos", json=payload, headers=HEADERS)
    if res.status_code == 200:
        print(f"Event Created: {res.json()['id']}")
        return res.json()['id']
    else:
        print(f"Error creating event: {res.text}")
        return None

def report_availability(unit_name, region, func_qty, veh_qty, observations, equipos=None):
    print(f"Reporting availability for {unit_name}...")
    payload = {
        "unidad": unit_name,
        "regionOJefatura": region,
        "funcionariosDisponibles": func_qty,
        "vehiculosDisponibles": veh_qty,
        "observaciones": observations,
        "fechaReporte": datetime.datetime.now().isoformat(),
        "equiposDisponibles": json.dumps(equipos) if equipos else "[]"
    }
    res = requests.post(f"{API_URL}/disponibilidad", json=payload, headers=HEADERS)
    if res.status_code == 200:
        return res.json()
    else:
        print(f"Error reporting availability: {res.text}")
        return None

def create_inventory():
    print("Creating Inventory Items...")
    items = [
        {"nombre": "RACIÓN DE COMBATE", "unidad": "UNIDADES", "cantidad": 5000, "categoria": "ALIMENTACION"},
        {"nombre": "AGUA POTABLE", "unidad": "LITROS", "cantidad": 10000, "categoria": "HIDRATACION"},
        {"nombre": "EQUIPO FORENSE", "unidad": "KIT", "cantidad": 50, "categoria": "CRIMINALISTICA"},
        {"nombre": "CANIL MÓVIL", "unidad": "UNIDAD", "cantidad": 20, "categoria": "INFRAESTRUCTURA"}
    ]
    created = []
    for item in items:
        res = requests.post(f"{API_URL}/insumos", json=item, headers=HEADERS)
        if res.status_code == 200:
             created.append(res.json())
    return created

def create_deployment(event_id, availability_list):
    print("Creating Deployment...")
    # Target totals
    total_func = 50
    total_veh = 30
    
    payload = {
        "descripcion": "DESPLIEGUE OPERATIVO ZONA CERO",
        "encargado": "PREFECTO INSPECTOR ROJAS",
        "instrucciones": "Control de perímetro, levantamiento de pericias en zonas siniestradas, apoyo con ejemplares caninos para búsqueda.",
        "latitud": -36.8270,
        "longitud": -73.0503,
        "cantidadFuncionariosRequeridos": total_func,
        "cantidadVehiculosRequeridos": total_veh,
        "fechaSolicitud": datetime.datetime.now().isoformat(),
        "fechaInicio": datetime.datetime.now().isoformat(),
        "fechaTermino": (datetime.datetime.now() + datetime.timedelta(days=7)).isoformat()
    }
    
    res = requests.post(f"{API_URL}/eventos/{event_id}/despliegues", json=payload, headers=HEADERS)
    if res.status_code != 200:
        print(f"Error creating deployment: {res.text}")
        return
        
    deploy_id = res.json()['id']
    print(f"Deployment Created: {deploy_id}")
    
    # Create Solicitudes based on availability to match requirements
    # Logic: Distribute the 50/30 requirement among the reported units
    
    # Needs: 50 staff, 30 vehicles.
    # We have units with capacity. We'll verify we have enough and assign requests.
    
    current_func = 0
    current_veh = 0
    
    for unit_rep in availability_list:
        if current_func >= total_func and current_veh >= total_veh:
            break
            
        # Calculate what to ask from this unit
        ask_func = min(unit_rep['funcionariosDisponibles'], total_func - current_func)
        ask_veh = min(unit_rep['vehiculosDisponibles'], total_veh - current_veh)
        
        if ask_func > 0 or ask_veh > 0:
            sol_payload = {
                "despliegue": {"id": deploy_id},
                "regionDestino": unit_rep['regionOJefatura'],
                "unidadDestino": unit_rep['unidad'],
                "funcionariosRequeridos": ask_func,
                "vehiculosRequeridos": ask_veh,
                "estado": "PENDIENTE",
                "instrucciones": "Despliegue inmediato a zona roja."
            }
            requests.post(f"{API_URL}/solicitudes", json=sol_payload, headers=HEADERS)
            print(f"Requested {ask_func} staff, {ask_veh} veh from {unit_rep['unidad']}")
            current_func += ask_func
            current_veh += ask_veh

def main():
    # 1. Create Event
    event_id = create_event()
    if not event_id: return
    
    # 2. Mock Availability (Total > 50 staff, > 30 veh)
    units = [
        ("BRIGADA HOMICIDIOS CONCEPCION", "REGION DEL BIOBIO", 15, 8, "Equipo completo disponible", ["Kit Sitio Suceso", "Luces Forenses"]),
        ("BRIGADA ANTINARCOTICOS CHILLAN", "REGION DE ÑUBLE", 12, 6, "Vehículos 4x4 operativos", ["Dron Térmico"]),
        ("BRIGADA INVESTIGADORA DELITOS ECONOMICOS", "REGION DEL BIOBIO", 8, 4, "Personal de apoyo administrativo y logístico", ["Computadores", "Impresoras"]),
        ("BRIGADA ADIESTRAMIENTO CANINO ZONA SUR", "JEFATURA NACIONAL DE U. ESPECIALIZADAS", 10, 8, "10 binomios caninos listos (Búsqueda cadáveres)", ["Caniles", "Arneses"]),
        ("LACRIM REGIONAL CONCEPCION", "REGION DEL BIOBIO", 8, 4, "Peritos Huellográficos y Fotográficos", ["Cámaras", "Reactivos"]),
        ("PREFECTURA PROVINCIAL CONCEPCION", "REGION DEL BIOBIO", 10, 5, "Mando y control", ["Carpas Mando", "Generador"])
    ]
    
    avail_data = []
    for u in units:
        rep = report_availability(u[0], u[1], u[2], u[3], u[4], u[5])
        if rep: avail_data.append(rep)
        
    # 3. Create Inventory
    create_inventory()
    
    # 4. Create Deployment & Requests
    create_deployment(event_id, avail_data)
    
    print("SEEDING COMPLETE. Verify in Frontend.")

if __name__ == "__main__":
    main()
