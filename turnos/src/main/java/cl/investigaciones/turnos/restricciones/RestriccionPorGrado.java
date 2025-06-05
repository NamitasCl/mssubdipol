package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.enums.Grado;
import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;
import java.util.Set;

public class RestriccionPorGrado implements RestriccionTurno {
    private final Set<Grado> gradosPermitidos;

    public RestriccionPorGrado(Set<Grado> gradosPermitidos) {
        this.gradosPermitidos = gradosPermitidos;
    }

    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        Grado grado = Grado.parseGrado(funcionario.getSiglasCargo());
        return gradosPermitidos.contains(grado);
    }

    @Override
    public String getNombre() { return "por_grado"; }
}