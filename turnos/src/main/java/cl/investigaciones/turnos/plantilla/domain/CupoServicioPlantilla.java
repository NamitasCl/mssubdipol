package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cupo_servicio_plantilla")
@Getter
@Setter
public class CupoServicioPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RolServicio rol;      // Ej: Encargado, Ayudante
    private int cantidad;    // Ej: 1 encargado, 2 ayudantes
    private boolean puedeConducir;
}
