package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recinto_servicio_plantilla")
@Getter
@Setter
public class RecintoServicioPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; // Ej: Guardia Principal, Guardia Frontis
    private int orden;     // Para mantener el índice (1, 2, etc.)

    @ManyToOne
    @JoinColumn(name = "servicio_plantilla_id")
    private ServicioPlantilla servicioPlantilla;
}
