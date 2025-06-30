package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.Map;

public class RestriccionMaxUnaNochePorSemana implements Restriccion {
    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion ctx) {
        LocalDate fechaAsignar = slot.getFecha();
        Map<LocalDate, String> turnos = ctx.getTurnosPorFechaPorFuncionario().get(funcionario.getId());
        if (turnos == null) return true; // No tiene turnos aún

        // Obtener el número de semana del año de la fecha a asignar
        int semana = fechaAsignar.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

        long nochesEstaSemana = turnos.entrySet().stream()
                .filter(e -> {
                    int semanaTurno = e.getKey().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
                    return semanaTurno == semana && e.getValue().toLowerCase().contains("noche");
                })
                .count();

        // Si ya tiene 1 o más noches esa semana, NO asignar otra
        return nochesEstaSemana < 1;
    }
}
