package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

public class RestriccionMaximoTurnos implements Restriccion {

    private final int maximoTurnos;

    public RestriccionMaximoTurnos(int maximoTurnos) {
        this.maximoTurnos = maximoTurnos;
    }

    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        int turnos = ctx.getTurnosPorFuncionario()
                .getOrDefault(funcionario.getIdFuncionario(), 0);
        return turnos < maximoTurnos;
    }
}
