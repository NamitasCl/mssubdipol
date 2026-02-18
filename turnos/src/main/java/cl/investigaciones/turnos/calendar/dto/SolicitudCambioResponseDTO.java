package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.EstadoSolicitud;
import cl.investigaciones.turnos.calendar.domain.TipoCambio;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO de respuesta para solicitudes de cambio de turno.
 */
@Data
@Builder
public class SolicitudCambioResponseDTO {
    private Long id;
    
    // Información del slot original
    private Long idSlotOriginal;
    private LocalDate fechaSlotOriginal;
    private LocalTime horaInicioOriginal;
    private LocalTime horaFinOriginal;
    private String nombreServicioOriginal;
    private String recintoOriginal;
    
    // Información del slot reemplazo (si aplica)
    private Long idSlotReemplazo;
    private LocalDate fechaSlotReemplazo;
    private LocalTime horaInicioReemplazo;
    private LocalTime horaFinReemplazo;
    
    // Funcionarios
    private Integer idFuncionarioSolicitante;
    private String nombreFuncionarioSolicitante;
    private Integer idFuncionarioReemplazo;
    private String nombreFuncionarioReemplazo;
    
    // Estado
    private TipoCambio tipoCambio;
    private EstadoSolicitud estado;
    private String motivo;
    private String observacionAprobador;
    
    // Fechas
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaResolucion;
    
    // Aprobador
    private String nombreAprobador;
}
