package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


/**
 * Entidad que representa la ubicación (recinto)
 * En un lugar fisico pueden existir varios lugares donde se presta un servicio
 * Ej.: En un edificio pueden existir varios recintos (Frontis, Principal, Estacionamiento, etc.)
 * */
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
