package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaMemoConEstadoDTO extends FichaMemoDTO {
    private String estadoRevision; // SIN_REVISAR | PENDIENTE | APROBADO | OBSERVADO | etc.
    private String observacionesRevision;
    private String nombreRevisor;
    private OffsetDateTime fechaRevision;
}
