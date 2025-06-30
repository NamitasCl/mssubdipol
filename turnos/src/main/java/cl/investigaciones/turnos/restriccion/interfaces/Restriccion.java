package cl.investigaciones.turnos.restriccion.interfaces;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;

@FunctionalInterface
public interface Restriccion {
    boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion contexto);
}
