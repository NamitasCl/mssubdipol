// src/components/Permiso.jsx
export default function Permiso({ user, visibilidad, roles, owner, children }) {

    if (Array.isArray(visibilidad) && visibilidad.length > 0) {
        for (const v of visibilidad) {

            switch (v.tipoDestino) {
                case "publica":
                    return children;
                case "usuario":
                    if (`${v.valorDestinoSiglas.toLowerCase()}` === `${user.sub.toLowerCase()}`) return children;
                    break;
                case "unidad":
                    if (`${v.valorDestinoSiglas.toLowerCase()}` === `${user.siglasUnidad.toLowerCase()}`) return children;
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