package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequerimientoRegional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Evento evento;

    private String region; // Name of the region (e.g., "Metropolitana", "Valparaíso")

    private Integer cantidadFuncionarios;
    private Integer cantidadVehiculos;
    
    // Optional: Specialized requirements could be added here as JSON or separate fields
    // For MVP: keeping it to officials and vehicles count
}
