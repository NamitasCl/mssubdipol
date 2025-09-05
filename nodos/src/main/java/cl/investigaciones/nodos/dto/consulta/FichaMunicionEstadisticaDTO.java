package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaMunicionEstadisticaDTO {
    private String obs;

    // Ref memo
    private Long memoId;
    private String memoFolio;
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;
}
