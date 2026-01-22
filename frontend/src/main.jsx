import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.jsx";
// import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from "./components/contexts/AuthContext.jsx";
import {ScopeProvider} from "./components/contexts/ScopeContext.jsx";

createRoot(document.getElementById('root')).render(
    <ScopeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ScopeProvider>

)
