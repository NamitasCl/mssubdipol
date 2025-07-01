package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

public class RestriccionDummy implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte f, Slot slot, ContextoAsignacion contexto) {
        return true;
    }
}

