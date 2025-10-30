import {Outlet} from "react-router-dom";

export default function DevLayout() {
    return (
        <div>
            <nav className="navbar navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">Módulo de Desarrollo</span>
                </div>
            </nav>
            <div>
                <Outlet/>
            </div>
        </div>
    );
}