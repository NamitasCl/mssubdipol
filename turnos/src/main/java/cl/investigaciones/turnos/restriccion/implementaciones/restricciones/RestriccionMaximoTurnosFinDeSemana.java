package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

public class RestriccionMaximoTurnosFinDeSemana implements Restriccion {
    private final int maxTurnosFinDeSemana;

    public RestriccionMaximoTurnosFinDeSemana(int maxTurnosFinDeSemana) {
        this.maxTurnosFinDeSemana = maxTurnosFinDeSemana;
    }

    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        /*System.out.println("Aplicando " + this.getClass().getSimpleName());*/
        LocalDate fecha = slot.getFecha();
        DayOfWeek dow = fecha.getDayOfWeek();
        if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) return true;

        // Contar cuántos turnos en fines de semana ya tiene este funcionario
        Map<LocalDate, String> fechasAsignadas = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getId());
        if (fechasAsignadas == null) return true;
        long count = fechasAsignadas.keySet().stream()
                .filter(d -> {
                    DayOfWeek day = d.getDayOfWeek();
                    return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
                })
                .count();

        return count < maxTurnosFinDeSemana;
    }
}