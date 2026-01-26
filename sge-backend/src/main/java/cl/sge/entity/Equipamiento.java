package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Equipamiento - Physical assets that are returnable and have serial numbers.
 * Examples: Generators, Drones, Heavy machinery, Radios
 */
@Entity
@Table(name = "equipamiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipamiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo;           // Generador, Dron, Maquinaria, Radio
    private String codigoActivo;   // Institutional asset code
    private String numeroSerie;    // Manufacturer serial number
    
    @Enumerated(EnumType.STRING)
    private EstadoEquipamiento estado;
    
    private String ubicacionActual; // Current location (Unit name or Region)
    private String responsableRut;  // Assigned custodian RUT
    
    // Origin tracking
    private String unidadPropietaria; // Unit that owns this equipment
    private String regionPropietaria;
    
    public enum EstadoEquipamiento {
        DISPONIBLE,  // Ready to be assigned
        ASIGNADO,    // Currently deployed
        MANTENCION,  // Under maintenance
        BAJA         // Decommissioned
    }
}
