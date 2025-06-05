package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionDiasConsecutivos implements RestriccionTurno {
    private final int diasSeparacion;

    public RestriccionDiasConsecutivos(int diasSeparacion) {
        this.diasSeparacion = diasSeparacion;
    }

    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        for (int offset = 1; offset <= diasSeparacion; offset++) {
            if (contexto.tieneTurno(funcionario.getIdFuncionario(), dia - offset) || contexto.tieneTurno(funcionario.getIdFuncionario(), dia + offset)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public String getNombre() { return "dias_consecutivos"; }
}
