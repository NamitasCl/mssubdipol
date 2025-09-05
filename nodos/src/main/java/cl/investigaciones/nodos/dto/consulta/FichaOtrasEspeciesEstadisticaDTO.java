package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaOtrasEspeciesEstadisticaDTO {
    private String calidad;
    private String descripcion;
    private String nue;
    private String cantidad;
    private String avaluo;
    private String utilizadoComoArma;
    private String sitioSuceso;

    // Ref memo
    private Long memoId;
    private String memoFolio;
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;
}
