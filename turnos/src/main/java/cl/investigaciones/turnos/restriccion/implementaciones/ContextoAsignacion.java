package cl.investigaciones.turnos.restriccion.implementaciones;

import lombok.Data;

import java.time.LocalDate;
import java.util.*;

@Data
public class ContextoAsignacion {

    // 1. Turnos ya asignados por funcionario (idFuncionario -> cantidad)
    private Map<Long, Integer> turnosPorFuncionario = new HashMap<>();

    // 2. Fechas asignadas por funcionario (idFuncionario -> lista de fechas donde ya fue asignado)
    private Map<Long, Map<LocalDate, String>> turnosPorFechaPorFuncionario = new HashMap<>();

    // 3. Días no disponibles por funcionario (idFuncionario -> set de fechas no disponibles)
    private Map<Long, Set<LocalDate>> diasNoDisponibles = new HashMap<>();

    // (Opcional) Puedes agregar más estructuras según tus reglas

    // Agrega métodos para actualizar el contexto fácilmente

    public void agregarAsignacion(Long idFuncionario, LocalDate fechaServicio, String nombreTurno) {
        // Suma 1 al conteo de turnos
        turnosPorFuncionario.merge(idFuncionario, 1, Integer::sum);

        // Agrega la fecha asignada
        turnosPorFechaPorFuncionario
                .computeIfAbsent(idFuncionario, k -> new HashMap<>())
                .put(fechaServicio, nombreTurno);
    }
}

