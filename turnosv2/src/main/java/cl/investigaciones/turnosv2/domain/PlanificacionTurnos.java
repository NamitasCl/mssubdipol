package cl.investigaciones.turnosv2.domain;

import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Esta es la "caja" que entiende OptaPlanner/Timefold.
 * Contiene todas las piezas del puzzle.
 * NO es una entidad @Entity. Es un POJO temporal.
 */
@PlanningSolution // 1. Le dice a OptaPlanner que esta es la clase principal
@Data
@NoArgsConstructor
public class PlanificacionTurnos {

    // --- El Identificador del Problema (Útil para logs) ---
    @PlanningId
    private Long calendarioId;

    // --- LOS DATOS FIJOS (Hechos del Problema) ---

    @ProblemFactCollectionProperty // 2. "OptaPlanner, usa esto como datos de entrada"
    private List<Funcionario> funcionarios;

    @ProblemFactCollectionProperty // 3. "OptaPlanner, estos también son datos de entrada"
    private List<Slot> slots;

    // --- LAS DECISIONES (Las Piezas Móviles) ---

    @PlanningEntityCollectionProperty // 4. "OptaPlanner, esta es la lista que debes rellenar"
    private List<Asignacion> asignaciones;

    // --- LA PUNTUACIÓN ---
    @PlanningScore // 5. "OptaPlanner, escribe tu puntuación final aquí"
    private HardSoftScore score;

    // Constructor para crear el problema
    public PlanificacionTurnos(Long calendarioId, List<Funcionario> funcionarios, List<Slot> slots, List<Asignacion> asignaciones) {
        this.calendarioId = calendarioId;
        this.funcionarios = funcionarios;
        this.slots = slots;
        this.asignaciones = asignaciones;
    }
}