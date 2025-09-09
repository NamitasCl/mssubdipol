package cl.investigaciones.nodos.dto.serviciosespeciales;

import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import cl.investigaciones.nodos.domain.auditoriamemos.RolRevisor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MemoRevisadoRequestDTO {
    private EstadoRevision estado;
    private String observaciones;
    private Long memoId;
    private String nombreRevisor;
    private String unidadRevisor;
    private String usuarioRevisor;
    private RolRevisor rolRevisor; // opcional en request, default en backend
    private OffsetDateTime createdAt; // opcional en request, default en backend
    private String origen;
    private String requestId;
}
