import {useAuth} from "../AuthContext.jsx";
import {Navigate, useLocation} from "react-router-dom";

const AuthGuard = ({children}) => {
    const {isAuth, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Cargando sesión...</div>;
    }

    if (!isAuth) {
        return <Navigate state={{from: location}} to={"/login"} replace />
    }

    return children;
}

export default AuthGuard;