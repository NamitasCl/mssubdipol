package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionRepeticionDiaFuncionario implements RestriccionTurno {
    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        return !contexto.tieneTurno(funcionario.getIdFuncionario(), dia);
    }

    @Override
    public String getNombre() { return "repeticion_dia_funcionario"; }
}