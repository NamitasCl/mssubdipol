package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServicioDiario {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private DiaAsignacion diaAsignacion;

    @ManyToOne
    private PlantillaTurno plantillaTurno;

    @OneToMany(mappedBy = "servicioDiario")
    private List<AsignacionFuncionarioTurno> asignaciones;

    @ManyToOne
    @JoinColumn(name = "turno_asignacion_id")
    private TurnoAsignacion turnoAsignacion;
}

