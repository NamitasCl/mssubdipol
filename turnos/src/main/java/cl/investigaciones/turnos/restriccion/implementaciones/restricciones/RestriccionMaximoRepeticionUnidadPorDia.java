package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Map;

/**
 * Impide que más de N funcionarios de una misma unidad sean asignados en el mismo día.
 */
public class RestriccionMaximoRepeticionUnidadPorDia implements Restriccion {

    private final int maximoUnidad;

    public RestriccionMaximoRepeticionUnidadPorDia(int maximoUnidad) {
        this.maximoUnidad = maximoUnidad;
    }

    @Override
    public boolean puedeAsignar(FuncionarioAporte f, Slot slot, ContextoAsignacion contexto) {
        Long unidadId = f.getIdUnidad();
        LocalDate fecha = slot.getFecha();

        Map<Long, Map<LocalDate, Integer>> mapa = contexto.getTurnosPorUnidadPorDia();
        int cantidad = mapa
                .getOrDefault(unidadId, Map.of())
                .getOrDefault(fecha, 0);

        return cantidad < maximoUnidad;
    }
}
