package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Map;

public class RestriccionNoTurnoNocheAnterior implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporteResponseDTO funcionario, Slot slot, ContextoAsignacion ctx) {
        LocalDate diaAnterior = slot.getFecha().minusDays(1);
        Map<LocalDate, String> turnos = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getId());
        if (turnos != null) {
            String turnoPrevio =  turnos.get(diaAnterior);
            if (turnoPrevio != null && turnoPrevio.toLowerCase().contains("noche")) {
                return false;
            }
        }
        return true;
    }
}
