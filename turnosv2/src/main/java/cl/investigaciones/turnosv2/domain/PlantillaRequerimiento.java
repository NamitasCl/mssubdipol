package cl.investigaciones.turnosv2.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class PlantillaRequerimiento {

    @Id
    @GeneratedValue
    private Long id;

    // Ej: "Turno Normal", "Refuerzo Fin de Semana", "Servicio Especial 15-Nov"
    private String nombre;

    // La lista de roles/cantidades para ESTA plantilla
    // (Exactamente la misma clase @Embeddable que hicimos antes)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plantilla_configuracion", joinColumns = @JoinColumn(name = "plantilla_id"))
    private List<RequerimientoDia> requerimientos;

}
