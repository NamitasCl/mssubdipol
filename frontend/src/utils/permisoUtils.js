// src/utils/permisoUtils.js
export function tienePermiso(user, { roles = [], usuarios = [], unidades = [], isAdmin }) {
    if (!user) return false;

    if (roles.length > 0 && user.roles) {
        if (user.roles.some(r => roles.includes(r))) return true;
    }
    if (usuarios.length > 0 && user.idFuncionario) {
        if (usuarios.includes(user.idFuncionario)) return true;
    }
    if (unidades.length > 0 && user.siglasUnidad) {
        if (unidades.includes(user.siglasUnidad)) return true;
    }
    if (isAdmin) {

        return true;
    }

    return false;
}