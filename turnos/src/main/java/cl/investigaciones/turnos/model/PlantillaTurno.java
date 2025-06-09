package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class PlantillaTurno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private String tipoServicio;

    private LocalTime horaInicio;
    private LocalTime horaFin;

    @ElementCollection
    @CollectionTable(name = "plantilla_turno_rol", joinColumns = @JoinColumn(name = "plantilla_turno_id"))
    private List<RolPlantilla> roles;  // Ahora cada plantilla tiene la lista de roles

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<DayOfWeek> dias;

    @ElementCollection
    private List<String> restricciones;

    private int idFuncionario;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}


