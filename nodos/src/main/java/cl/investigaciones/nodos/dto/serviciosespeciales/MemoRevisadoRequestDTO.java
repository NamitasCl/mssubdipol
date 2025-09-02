package cl.investigaciones.nodos.dto.serviciosespeciales;

import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import lombok.Data;

@Data
public class MemoRevisadoRequestDTO {
    private EstadoRevision estado;
    private String observaciones;
    private Long memoId;
}
