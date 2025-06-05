package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Data
@Getter
@Setter
public class TurnoAsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes;
    private int anio;

    // Flag para indicar si el mes está abierto o cerrado
    private boolean activo;

    // Relación a las plantillas seleccionadas para este mes
    @ManyToMany
    @JoinTable(
            name = "turno_asignacion_plantillas",
            joinColumns = @JoinColumn(name = "turno_asignacion_id"),
            inverseJoinColumns = @JoinColumn(name = "plantilla_turno_id")
    )
    private List<PlantillaTurno> plantillasMes;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaAsignacion> asignaciones;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnidadColaboradora> unidadesColaboradoras;

    @ManyToMany
    @JoinTable(
            name = "turno_asignacion_plantilla",
            joinColumns = @JoinColumn(name = "turno_asignacion_id"),
            inverseJoinColumns = @JoinColumn(name = "plantilla_turno_id")
    )
    private List<PlantillaTurno> plantillas;

}