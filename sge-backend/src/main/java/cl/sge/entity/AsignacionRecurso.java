package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

/**
 * AsignacionRecurso - Response to a SolicitudRecurso.
 * Links the request to actual funcionarios and vehicles being deployed.
 */
@Entity
@Table(name = "asignacion_recurso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionRecurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "solicitud_id")
    private SolicitudRecurso solicitud;
    
    @ManyToOne
    @JoinColumn(name = "despliegue_id")
    private Despliegue despliegue;
    
    // WHO is assigning
    private String unidadOrigen;
    private String asignadoPor; // RUT of person making the assignment
    
    // WHAT is being assigned - Funcionarios
    @ManyToMany
    @JoinTable(
        name = "asignacion_recurso_funcionarios",
        joinColumns = @JoinColumn(name = "asignacion_id"),
        inverseJoinColumns = @JoinColumn(name = "funcionario_rut")
    )
    private List<Funcionario> funcionarios;
    
    // WHAT is being assigned - Vehicles
    @ManyToMany
    @JoinTable(
        name = "asignacion_recurso_vehiculos",
        joinColumns = @JoinColumn(name = "asignacion_id"),
        inverseJoinColumns = @JoinColumn(name = "vehiculo_sigla")
    )
    private List<Vehiculo> vehiculos;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaAsignacion;
    
    // Confirmation workflow
    private boolean confirmadoPorDestino;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaConfirmacion;
    
    @Column(columnDefinition = "TEXT")
    private String equipos; // JSON array of assigned equipment names

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
