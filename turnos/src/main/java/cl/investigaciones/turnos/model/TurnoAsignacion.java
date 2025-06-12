package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    private String nombreCalendario;
    private int idFuncionario; // Creador del calendario de turnos.


    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaAsignacion> asignaciones;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnidadColaboradora> unidadesColaboradoras;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AsignacionFuncionario> asignacionFuncionarios;

    @ManyToMany
    @JoinTable(
            name = "turno_asignacion_plantilla",
            joinColumns = @JoinColumn(name = "turno_asignacion_id"),
            inverseJoinColumns = @JoinColumn(name = "plantilla_turno_id")
    )
    private List<PlantillaTurno> plantillas;

    private LocalDate createdAt;
    private LocalDate updatedAt;

}