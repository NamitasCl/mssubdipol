package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * DisponibilidadRecursos - Resource availability reported by regions/jefaturas.
 * Anyone from a unit can report what they have available for deployment.
 * No special permissions required for reporting.
 */
@Entity
@Table(name = "disponibilidad_recursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibilidadRecursos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Organization hierarchy
    private String unidad;           // Prefectura, Unidad específica
    private String regionOJefatura;  // Región Policial or Jefatura Nacional
    
    // NEW: Link to Event
    @Column(name = "evento_id")
    private Long eventoId;           // The event this availability is for
    
    // Available resources
    private Integer funcionariosDisponibles;
    private Integer vehiculosDisponibles;
    
    @Column(columnDefinition = "TEXT")
    private String equiposDisponibles; // JSON array of equipment/specialties
    
    @Column(columnDefinition = "TEXT")
    private String observaciones; // Additional notes
    
    // Tracking
    private String reportadoPor; // Name or RUT of person reporting
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaReporte;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaActualizacion; // Last update
    
    // Status
    @Enumerated(EnumType.STRING)
    private EstadoDisponibilidad estado;
    
    public enum EstadoDisponibilidad {
        DISPONIBLE,      // Resources available for deployment
        PARCIAL,         // Some resources committed/deployed
        COMPROMETIDO,    // All resources committed to deployments
        NO_DISPONIBLE    // Resources unavailable (maintenance, etc.)
    }
    
    @PrePersist
    protected void onCreate() {
        fechaReporte = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoDisponibilidad.DISPONIBLE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
