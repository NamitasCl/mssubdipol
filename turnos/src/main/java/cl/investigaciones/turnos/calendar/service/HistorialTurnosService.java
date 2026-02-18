package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio para verificar el historial de turnos de funcionarios
 * y aplicar restricciones basadas en turnos anteriores.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HistorialTurnosService {

    private final SlotRepository slotRepository;

    // Hora de fin de turno nocturno (08:00)
    private static final LocalTime HORA_FIN_NOCHE = LocalTime.of(8, 0);
    // Hora de inicio de turno nocturno (20:00)
    private static final LocalTime HORA_INICIO_NOCHE = LocalTime.of(20, 0);

    /**
     * Obtiene los días trabajados por un funcionario en los últimos N meses.
     */
    public Set<LocalDate> getDiasTrabajadosUltimos2Meses(Integer idFuncionario, LocalDate fechaReferencia) {
        LocalDate desde = fechaReferencia.minusMonths(2).withDayOfMonth(1);
        LocalDate hasta = fechaReferencia.minusDays(1);
        
        List<Slot> slotsAnteriores = slotRepository.findByFuncionarioAndFechaBetween(idFuncionario, desde, hasta);
        
        return slotsAnteriores.stream()
                .map(Slot::getFecha)
                .collect(Collectors.toSet());
    }

    /**
     * Verifica si el funcionario trabajó un fin de semana en los últimos 2 meses.
     */
    public boolean trabajoFinDeSemanaReciente(Integer idFuncionario, LocalDate fechaReferencia) {
        LocalDate hace2Meses = fechaReferencia.minusMonths(2).withDayOfMonth(1);
        LocalDate ayer = fechaReferencia.minusDays(1);
        
        List<Slot> slotsFds = slotRepository.findFinDeSemanaByFuncionario(idFuncionario, hace2Meses, ayer);
        return !slotsFds.isEmpty();
    }

    /**
     * Verifica si el funcionario está en período de descanso post-noche.
     * Turno noche: 20:00 - 08:00 del día siguiente.
     * Descanso: hasta las 00:00 del día siguiente al fin del turno.
     * 
     * Ejemplo: Si terminó turno el día 5 a las 08:00,
     * no puede trabajar el día 5 (saliente) ni el día 6 hasta las 00:00.
     */
    public boolean estaEnDescansoPostNoche(Integer idFuncionario, LocalDate fechaSlot) {
        // Verificar si trabajó turno nocturno el día anterior o hace 2 días
        LocalDate ayer = fechaSlot.minusDays(1);
        LocalDate anteayer = fechaSlot.minusDays(2);
        
        List<Slot> slotsRecientes = slotRepository.findByFuncionarioAndFechaBetween(
                idFuncionario, anteayer, ayer
        );
        
        for (Slot slot : slotsRecientes) {
            // Si el turno empezó a las 20:00 o después (turno nocturno)
            if (slot.getHoraInicio() != null && 
                !slot.getHoraInicio().isBefore(HORA_INICIO_NOCHE)) {
                
                // Si el slot es de ayer y terminó hoy a las 08:00
                // entonces hoy es día saliente completo
                if (slot.getFecha().equals(ayer)) {
                    log.debug("Funcionario {} en descanso post-noche (turno de ayer)", idFuncionario);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Verifica si la fecha del slot es fin de semana (sábado o domingo).
     */
    public boolean esFinDeSemana(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        return dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY;
    }

    /**
     * Obtiene el día de la semana (1-7) de una fecha en los meses anteriores
     * para verificar si el funcionario ya trabajó ese mismo día del mes.
     */
    public boolean trabajoMismoDiaMesAnterior(Integer idFuncionario, LocalDate fechaSlot) {
        // Obtener el número de día del mes (ej: día 15)
        int diaDelMes = fechaSlot.getDayOfMonth();
        
        // Verificar mes anterior
        LocalDate mesAnterior = fechaSlot.minusMonths(1);
        LocalDate diaAnterior = mesAnterior.withDayOfMonth(
                Math.min(diaDelMes, mesAnterior.lengthOfMonth())
        );
        
        // Verificar hace 2 meses
        LocalDate hace2Meses = fechaSlot.minusMonths(2);
        LocalDate dia2MesesAtras = hace2Meses.withDayOfMonth(
                Math.min(diaDelMes, hace2Meses.lengthOfMonth())
        );
        
        Set<LocalDate> diasTrabajados = getDiasTrabajadosUltimos2Meses(idFuncionario, fechaSlot);
        
        return diasTrabajados.contains(diaAnterior) || diasTrabajados.contains(dia2MesesAtras);
    }
}
