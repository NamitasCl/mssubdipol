package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Map;

public class RestriccionNoDosTurnosMismoDia implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        Map<LocalDate, String> turnos = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getIdFuncionario());
        if (turnos == null) return true;
        return !turnos.containsKey(slot.getFecha());
    }
}
