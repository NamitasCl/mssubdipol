package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AporteUnidadItemRequestProcepolDTO {
    private Long idCalendario;
    private Boolean agruparFinDeSemana;
    private List<AporteUnidadItemProcepolDTO> unidades;
}
