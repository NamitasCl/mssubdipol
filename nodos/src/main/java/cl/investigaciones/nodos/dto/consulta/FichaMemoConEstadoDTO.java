package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class FichaMemoConEstadoDTO extends FichaMemoDTO {
    private String estadoRevision;           // PENDIENTE, APROBADO, OBSERVADO, etc.
    private String observacionesRevision;    // texto libre
    private String nombreRevisor;            // quién
    private String unidadRevisor;            // unidad del revisor
    private String rolRevisor;               // JEFE, PLANA, etc.
    private OffsetDateTime fechaRevision;    // createdAt del evento de revisión

    private List<FichaOtrasEspeciesDTO> fichaOtrasEspecies;
}
