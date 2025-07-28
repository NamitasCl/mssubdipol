package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Set;

public class RestriccionNoDisponiblePorAsignacionTurno implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        /*System.out.println("Aplicando " + this.getClass().getSimpleName());*/
        Set<LocalDate> diasNoDisp = ctx.getDiasNoDisponiblesPorAsignacion().get(funcionario.getId());
        if (diasNoDisp == null) return true;

        return !diasNoDisp.contains(slot.getFecha());
    }
}