package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlantillaTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;

    private String tipoServicio;

    private LocalTime horaInicio;
    private LocalTime horaFin;

    private int cantidadFuncionarios;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<DayOfWeek> dias;

    @ElementCollection
    private List<String> restricciones;

    @ElementCollection
    private List<String> gradosPermitidos; // ["SPF", "COM", "SBC"]

}
