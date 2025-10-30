// src/components/CalendarioList.jsx

// (Necesitaremos un 'Link' del router, por ahora simulamos con 'a')
// import { Link } from 'react-router-dom';
const Link = ({to, children, ...props}) => <a href={to} {...props}>{children}</a>;

// Helper para dar color al estado (Badge)
const getEstadoBadge = (estado) => {
    switch (estado) {
        case "EN_CONFIGURACION":
            return "bg-warning text-dark";
        case "PUBLICADO":
            return "bg-success";
        default:
            return "bg-secondary";
    }
};

export default function CalendarioList({calendarios}) {
    return (
        <div className="row g-3">
            {calendarios.length === 0 ? (
                <p className="text-muted">No hay calendarios creados.</p>
            ) : (
                calendarios.map((cal) => (
                    <div key={cal.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <h5 className="card-title">{cal.nombre}</h5>
                                    <span className={`badge ${getEstadoBadge(cal.estado)}`}>
                                        {cal.estado}
                                    </span>
                                </div>
                                <p className="card-text text-muted small">
                                    {cal.fechaInicio} al {cal.fechaFin}
                                </p>
                            </div>
                            <div className="card-footer bg-light text-end">
                                {cal.estado === "EN_CONFIGURACION" && (
                                    <Link
                                        to={`/calendarios/${cal.id}/configurar`}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Configurar
                                    </Link>
                                )}
                                {cal.estado === "PUBLICADO" && (
                                    <Link
                                        to={`/calendarios/${cal.id}/ver`}
                                        className="btn btn-outline-success btn-sm"
                                    >
                                        Ver
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}