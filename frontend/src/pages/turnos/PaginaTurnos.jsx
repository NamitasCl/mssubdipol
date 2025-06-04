// En tu página:
import SelectorTipoTurno from "./SelectorTipoTurno";
import { useScope } from "../../components/contexts/ScopeContext.jsx"; // si usas el contexto sugerido

export default function PaginaTurnos() {
    const { setScope } = useScope();

    return (
        <SelectorTipoTurno
            onSeleccion={tipo => {
                setScope({ tipo });
                // Redireccionar o renderizar según el tipo seleccionado
                console.log(tipo)
            }}
        />
    );
}