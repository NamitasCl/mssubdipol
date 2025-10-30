package cl.investigaciones.turnosv2.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@PlanningEntity
@Data
public class Asignacion {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    private Slot slot;

    @PlanningVariable
    @ManyToOne
    private Funcionario funcionario;

    /**
     * Helper para obtener la fecha de esta asignación.
     * Facilita la escritura de reglas.
     */
    public LocalDate getFecha() {
        if (this.slot == null) {
            return null;
        }
        return this.slot.getFecha();
    }

    /**
     * Helper para obtener el ID del funcionario.
     * Facilita la escritura de reglas.
     */
    public Long getFuncionarioId() {
        if (this.funcionario == null) {
            return null;
        }
        return this.funcionario.getId();
    }
}
