package cl.investigaciones.turnos.restriccion.interfaces;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;

@FunctionalInterface
public interface Restriccion {
    boolean puedeAsignar(FuncionarioAporteResponseDTO funcionario, Slot slot, ContextoAsignacion contexto);
}
