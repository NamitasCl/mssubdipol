package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "solicitud_cambio_turno")
@Data
public class SolicitudCambioTurno {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long idSlotOrigen;
    
    @Column(nullable = false)
    private Long idSlotDestino;
    
    @Column(nullable = false)
    private Integer idFuncionarioSolicitante;
    
    @Column(nullable = false)
    private Integer idFuncionarioDestino;
    
    @Column(nullable = false, length = 50)
    private String siglasUnidadOrigen;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;
    
    private Integer idAprobador;
    
    @Column(columnDefinition = "TEXT")
    private String motivoRechazo;
    
    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaSolicitud;
    
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaResolucion;
    
    @PrePersist
    protected void onCreate() {
        if (fechaSolicitud == null) {
            fechaSolicitud = OffsetDateTime.now(ZoneId.of("America/Santiago"));
        }
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE;
        }
    }
}
