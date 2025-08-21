package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ConsultaUnidadDto {
    private int idUnidad;
    private String nombreUnidad;
    private String siglasUnidad;
    private String nombreComuna;
    private String nombreRegion;
    private String nombreUnidadReporta;
    private String nombreUnidadPertenece;
    private Integer operativa;


}
