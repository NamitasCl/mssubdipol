package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Map;

public class RestriccionNochesConsecutivas implements Restriccion {
    private final String palabraClaveNoche;
    private final int maxNochesConsecutivas;

    public RestriccionNochesConsecutivas(int maxNochesConsecutivas) {
        this.palabraClaveNoche = "noche";
        this.maxNochesConsecutivas = maxNochesConsecutivas;
    }

    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        /*System.out.println("Aplicando " + this.getClass().getSimpleName());*/
        LocalDate fecha = slot.getFecha();
        Map<LocalDate, String> fechasAsignadas = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getId());
        if (fechasAsignadas == null) return true;

        // Contar noches consecutivas hacia atrás
        int nochesConsecutivas = 0;
        for (int offset = 1; offset <= maxNochesConsecutivas; offset++) {
            LocalDate prevDia = fecha.minusDays(offset);
            String turnoPrevio = fechasAsignadas.get(prevDia);
            if (turnoPrevio != null && turnoPrevio.toLowerCase().contains(palabraClaveNoche)) {
                nochesConsecutivas++;
            } else {
                break;
            }
        }
        // Si ya cumplió el límite, no asignar más
        return nochesConsecutivas < maxNochesConsecutivas;
    }
}