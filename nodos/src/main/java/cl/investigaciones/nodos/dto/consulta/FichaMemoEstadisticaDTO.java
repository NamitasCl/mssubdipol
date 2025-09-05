package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaMemoEstadisticaDTO {
    private Long memoId;
    private String memoFolio;
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;

    private Integer totalPersonas;
    private Integer totalArmas;
    private Integer totalDrogas;
    private Integer totalDineros;
    private Integer totalVehiculos;
    private Integer totalMuniciones;
    private Integer totalOtrasEspecies;
}
