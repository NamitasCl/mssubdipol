package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * SolicitudRecurso - Resource request from PM-SUB to regions/units.
 * Implements the delegation flow: PM-SUB -> PM-REG -> Jefe Unidad
 */
@Entity
@Table(name = "solicitud_recurso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudRecurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "despliegue_id")
    private Despliegue despliegue;
    
    // Target of the request
    private String regionDestino;
    private String unidadDestino; // NULL if directed to entire region
    
    // Requirements
    private Integer funcionariosRequeridos;
    private Integer vehiculosRequeridos;
    
    @Column(columnDefinition = "TEXT")
    private String especialidadesRequeridas; // JSON array of specialties needed
    
    @Column(columnDefinition = "TEXT")
    private String instrucciones; // Additional instructions
    
    // State Machine
    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;
    
    // Tracking
    private String creadoPor;          // RUT of creator (PM-SUB)
    private String delegadoA;          // RUT if delegated to sub-unit
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaCreacion;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaRespuesta;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaLimite; // Deadline for fulfillment
    
    // Computed fields (populated by service layer)
    @Transient
    private Integer funcionariosAsignados;
    @Transient
    private Integer vehiculosAsignados;
    @Transient
    private Double porcentajeCumplimiento;
    
    public enum EstadoSolicitud {
        PENDIENTE,      // Just created, waiting for response
        DELEGADA,       // Passed down to sub-unit
        PARCIAL,        // Some resources assigned, not complete
        CUMPLIDA,       // 100% fulfilled
        RECHAZADA       // Cannot fulfill (with reason)
    }
}
