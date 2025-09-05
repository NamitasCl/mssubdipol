package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaArmaEstadisticaDTO {
    // Datos de arma
    private String serieArma;
    private String calidad;
    private String marcaArma;
    private String condicion;
    private String calibreArma;
    private String tipoArma;
    private String obs;

    // Referencia al memo
    private Long memoId;
    private String memoFolio;
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;
}
