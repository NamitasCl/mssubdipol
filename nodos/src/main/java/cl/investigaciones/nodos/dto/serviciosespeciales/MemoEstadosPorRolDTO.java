package cl.investigaciones.nodos.dto.serviciosespeciales;

import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import lombok.Data;

@Data
public class MemoEstadosPorRolDTO {
    private Long memoId;
    private EstadoRevision estadoGlobal;
    private MemoRevisionDetalleDTO jefe;
    private MemoRevisionDetalleDTO contralor;
    private MemoRevisionDetalleDTO plana;
}