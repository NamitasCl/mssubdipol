package cl.investigaciones.nodos.dto.serviciosespeciales;

import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MemoRevisadoRequestDTO {
    private EstadoRevision estado;
    private String observaciones;
    private Long memoId;
    private String nombreRevisor;
    private String unidadRevisor;
    private Boolean revisadoPlana;
    private OffsetDateTime fechaRevisionPlana;
}
