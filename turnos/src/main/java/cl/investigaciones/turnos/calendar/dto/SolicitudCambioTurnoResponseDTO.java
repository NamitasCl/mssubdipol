package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.EstadoSolicitud;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class SolicitudCambioTurnoResponseDTO {
    private Long id;
    private EstadoSolicitud estado;
    private OffsetDateTime fechaSolicitud;
    private OffsetDateTime fechaResolucion;
    private String motivoRechazo;
    
    // Detalles del slot origen
    private SlotDetalleDTO slotOrigen;
    
    // Detalles del slot destino
    private SlotDetalleDTO slotDestino;
    
    // Nombres enriquecidos
    private String nombreSolicitante;
    private String nombreDestino;
    private String nombreAprobador;
    
    @Data
    @Builder
    public static class SlotDetalleDTO {
        private Long id;
        private LocalDate fecha;
        private String nombreServicio;
        private String rolRequerido;
        private Integer idFuncionario;
        private String nombreFuncionario;
        private String siglasUnidad;
    }
}
