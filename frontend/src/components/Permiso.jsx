// src/components/Permiso.jsx
import { tienePermiso } from "../utils/permisoUtils";

export default function Permiso({ user, roles = [], usuarios = [], unidades = [], isAdmin, children }) {
    return tienePermiso(user, { roles, usuarios, unidades, isAdmin }) ? children : false;
}