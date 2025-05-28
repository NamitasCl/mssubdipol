// src/components/Permiso.jsx
export default function Permiso({ user, visibilidad, roles, owner, children }) {
    console.log("User: ", user);
    console.log("Visibilidad: ", visibilidad);
    console.log("Roles: ", roles);
    if (Array.isArray(visibilidad) && visibilidad.length > 0) {
        for (const v of visibilidad) {
            console.log(user.sub)
            switch (v.tipoDestino) {
                case "publica":
                    return children;
                case "usuario":
                    if (`${v.valorDestinoNombre.toLowerCase()}` === `${user.sub.toLowerCase()}`) return children;
                    break;
                case "unidad":
                    if (`${v.valorDestinoNombre.toLowerCase()}` === `${user.siglasUnidad.toLowerCase()}`) return children;
                    break;
                case "grupo":
                    // Si tienes grupos en user (array), compara:
                    if (user.grupos && user.grupos.includes(v.valorDestino)) return children;
                    break;
            }
        }
        return null; // No coincide ninguna regla, no muestra children
    }

    if (roles && Array.isArray(roles)) {
        if (user.roles && user.roles.some(r => roles.includes(r))) return children;
    }
    if(owner === user.idFuncionario) {
        return children;
    }
}