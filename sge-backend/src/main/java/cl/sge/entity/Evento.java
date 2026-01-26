package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descripcion;
    private String tipo; // Incendio, Terremoto, etc.
    // private String region; // Deprecated single region
    
    @ElementCollection
    @CollectionTable(name = "evento_regiones", joinColumns = @JoinColumn(name = "evento_id"))
    @Column(name = "region")
    private java.util.List<String> regiones;

    // NEW: GeoJSON stored as JSONB for flexible geometry (Point, Polygon, MultiPolygon)
    @Column(columnDefinition = "TEXT")
    private String zonaAfectada; // GeoJSON Feature string

    // Legacy fields - deprecated but kept for backward compatibility
    @Deprecated
    private Double latitud;
    @Deprecated
    private Double longitud;
    @Deprecated
    private Double radio; // Radius in meters

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fecha;
    
    // NEW: Ownership tracking for RBAC
    private String creadoPor; // RUT of creator
    
    @Enumerated(EnumType.STRING)
    private EstadoEvento estado;
    
    public enum EstadoEvento {
        ACTIVO, CERRADO, SUSPENDIDO
    }

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RequerimientoRegional> requerimientos;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Despliegue> despliegues;
}
