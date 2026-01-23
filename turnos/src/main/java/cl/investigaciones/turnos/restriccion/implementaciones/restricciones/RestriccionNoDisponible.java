package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Set;

public class RestriccionNoDisponible implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        /*System.out.println("Aplicando " + this.getClass().getSimpleName());*/
        Set<LocalDate> diasNoDisp = ctx.getDiasNoDisponibles().get(funcionario.getId());
        if (diasNoDisp == null) return true;

        if (diasNoDisp.contains(slot.getFecha())) {
            return false;
        }

        // Check for overnight shift (crossing midnight)
        if (slot.getHoraFin() != null && slot.getHoraInicio() != null && 
            slot.getHoraFin().isBefore(slot.getHoraInicio())) {
            
            LocalDate nextDay = slot.getFecha().plusDays(1);
            if (diasNoDisp.contains(nextDay)) {
                return false;
            }
        }

        return true;
    }
}