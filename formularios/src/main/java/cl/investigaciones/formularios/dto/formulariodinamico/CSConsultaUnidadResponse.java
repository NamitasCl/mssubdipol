package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CSConsultaUnidadResponse {
    public Integer idUnidad;
    public String nombreUnidad;
    public String siglasUnidad;
}
