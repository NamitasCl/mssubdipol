package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Map;

public class RestriccionSeparacionDias implements Restriccion {
    private final int minDiasSeparacion;

    public RestriccionSeparacionDias(int minDiasSeparacion) {
        this.minDiasSeparacion = minDiasSeparacion;
    }

    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        Map<LocalDate, String> fechasAsignadas = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getIdFuncionario());
        if (fechasAsignadas != null) {
            LocalDate fecha = slot.getFecha();
            for (LocalDate asignada : fechasAsignadas.keySet()) {
                if (Math.abs(fecha.toEpochDay() - asignada.toEpochDay()) < minDiasSeparacion) {
                    return false; // Muy cerca de otro turno ya asignado
                }
            }
        }
        return true;
    }
}