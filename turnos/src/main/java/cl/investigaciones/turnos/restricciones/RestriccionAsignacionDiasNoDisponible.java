package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionAsignacionDiasNoDisponible implements RestriccionTurno {
    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        return !contexto.estaMarcadoNoDisponible(funcionario.getIdFuncionario(), dia);
    }

    @Override
    public String getNombre() { return "dias_no_disponible"; }
}
