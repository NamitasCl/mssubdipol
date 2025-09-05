package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaDineroEstadisticaDTO {
    private String calidad;
    private Double monto;
    private String obs;

    // Ref memo
    private Long memoId;
    private String memoFolio;
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;
}
