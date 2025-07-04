package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

public class RestriccionUnSoloRolPorServicio implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        /*System.out.println("Aplicando " + this.getClass().getSimpleName());*/
        return !ctx.yaAsignadoAlServicio(funcionario.getIdFuncionario(), slot.getFecha(), slot.getNombreServicio());
    }
}

