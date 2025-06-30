package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

public class RestriccionUnSoloRolPorServicio implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporteResponseDTO funcionario, Slot slot, ContextoAsignacion ctx) {
        return !ctx.yaAsignadoAlServicio(funcionario.getId(), slot.getFecha(), slot.getNombreServicio());
    }
}

