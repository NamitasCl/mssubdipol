package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AporteUnidadItemProcepolDTO {

    private Long idCalendario;
    private Long idUnidad;
    private String siglasUnidad;
    private Integer cantidadLunesViernes;
    private Integer cantidadSabado;
    private Integer cantidadDomingo;
    private Integer cantidadFestivo;

}
