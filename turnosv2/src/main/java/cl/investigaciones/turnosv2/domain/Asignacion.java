package cl.investigaciones.turnosv2.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import jakarta.persistence.*;
import lombok.Data;

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
}
