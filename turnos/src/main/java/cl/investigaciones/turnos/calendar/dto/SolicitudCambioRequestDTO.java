package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.TipoCambio;
import lombok.Data;

/**
 * DTO para crear una solicitud de cambio de turno.
 */
@Data
public class SolicitudCambioRequestDTO {
    private Long idSlotOriginal;
    private Long idSlotReemplazo;      // null si es cesión
    private Integer idFuncionarioReemplazo;
    private String nombreFuncionarioReemplazo;
    private TipoCambio tipoCambio;
    private String motivo;
}
