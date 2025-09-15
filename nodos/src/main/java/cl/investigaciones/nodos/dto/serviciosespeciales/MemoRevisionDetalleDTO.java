package cl.investigaciones.nodos.dto.serviciosespeciales;

import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import cl.investigaciones.nodos.domain.auditoriamemos.RolRevisor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MemoRevisionDetalleDTO {
    private Long id;
    private Long memoId;
    private EstadoRevision estado;
    private RolRevisor rolRevisor;
    private String observaciones;
    private String nombreRevisor;
    private String unidadRevisor;
    private String usuarioRevisor;
    private OffsetDateTime createdAt;
    private String origen;
    private String requestId;
}