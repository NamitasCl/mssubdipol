package cl.investigaciones.turnosv2.solver;

import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;
import cl.investigaciones.turnosv2.domain.Asignacion;
import org.springframework.stereotype.Component;

@Component
public class PlanificacionConstraintProvider implements ConstraintProvider {

    /**
     * Este es el método principal que OptaPlanner/Timefold llama.
     * Registra todas nuestras reglas.
     */
    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[]{
                // Registramos nuestra primera regla:
                noDosTurnosSimultaneos(constraintFactory)

                // ... aquí añadiremos más reglas luego ...
        };
    }

    // --- REGLAS DURAS (HARD CONSTRAINTS) ---

    /**
     * REGLA DURA: Un funcionario no puede estar en dos Asignaciones
     * (turnos) en la misma fecha.
     */
    private Constraint noDosTurnosSimultaneos(ConstraintFactory factory) {
        // Empezamos la "corriente" (stream) de datos
        return factory
                // 1. Mira cada par único de Asignaciones (Asignacion A, Asignacion B)
                .forEachUniquePair(Asignacion.class,

                        // 2. Filtra: quédate solo con los pares que...
                        // ...tengan el MISMO funcionario
                        Joiners.equal(Asignacion::getFuncionario),

                        // ...y que sean en la MISMA fecha
                        Joiners.equal(Asignacion::getFecha)
                )
                // 3. Si un par (A, B) pasa ambos filtros, es un conflicto.
                // ¡Penaliza!
                .penalize(HardSoftScore.ONE_HARD, // 1 punto de penalización DURA
                        (asignacionA, asignacionB) -> 1 // Contamos 1 por cada par en conflicto
                )
                // 4. Dale un nombre a la regla (para depuración)
                .asConstraint("Dos turnos simultáneos para el mismo funcionario");
    }
}