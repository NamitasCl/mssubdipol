// src/components/Permiso.jsx
export default function Permiso({ user, visibilidad, children }) {
    if (Array.isArray(visibilidad) && visibilidad.length > 0) {
        for (const v of visibilidad) {
            switch (v.tipoDestino) {
                case "publica":
                    return children;
                case "usuario":
                    if (`${v.valorDestino}` === `${user.idFuncionario}`) return children;
                    break;
                case "unidad":
                    if (`${v.valorDestino}` === `${user.siglasUnidad}`) return children;
                    break;
                case "grupo":
                    // Si tienes grupos en user (array), compara:
                    if (user.grupos && user.grupos.includes(v.valorDestino)) return children;
                    break;
            }
        }
        return null; // No coincide ninguna regla, no muestra children
    }
}