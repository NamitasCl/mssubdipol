package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Despliegue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Evento evento;

    private String descripcion; // Zone description or specific mission
    private String encargado; // Operational Commander for this deployment
    private String instrucciones; // Specific instructions for the team

    // Coordinates for this specific deployment zone (optional, if different from event)
    private Double latitud;
    private Double longitud;

    // Requirements
    private Integer cantidadFuncionariosRequeridos;
    private Integer cantidadVehiculosRequeridos;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaSolicitud; // When the deployment was requested/created
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaInicio;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaTermino;
    
    private Integer numeroProrrogas = 0;
    
    // Provisiones linked specifically to this deployment context
    @OneToOne(cascade = CascadeType.ALL)
    private Provisiones provisiones;
}
