-- Insertar configuración del módulo Nodos
INSERT INTO module_config (module_key, title, description, route, icon_name, color, enabled)
VALUES ('nodos', 'Búsqueda de Relaciones', 'Explora conexiones entre personas, vehículos y eventos mediante grafos interactivos.', '/grafos', 'Map', 'indigo', true)
ON CONFLICT (module_key) DO UPDATE 
SET title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    route = EXCLUDED.route, 
    icon_name = EXCLUDED.icon_name, 
    color = EXCLUDED.color;

-- Asignar roles permitidos para el módulo Nodos
-- Se asume que estos roles existen en el sistema (ADMIN, JEFE, SUBJEFE, SECUIN, USER)
INSERT INTO module_roles (module_key, role_name)
VALUES 
    ('nodos', 'ADMIN'),
    ('nodos', 'JEFE'),
    ('nodos', 'SUBJEFE'),
    ('nodos', 'SECUIN'),
    ('nodos', 'USER')
ON CONFLICT DO NOTHING;
