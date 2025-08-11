package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


/**
 * Entidad que representa un cupo dentro de un servicio en una plantilla de turnos.
 * Un cupo define el rol, la cantidad de personas necesarias y si pueden conducir.
 * Ej.: 1 Encargado que puede conducir, 2 Ayudantes que no pueden conducir.
 * */

@Entity
@Table(name = "cupo_servicio_plantilla")
@Getter
@Setter
public class CupoServicioPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RolServicio rol;      // Ej.: Encargado, Ayudante
    private int cantidad;    // Ej: 1 encargado, 2 ayudantes
}
