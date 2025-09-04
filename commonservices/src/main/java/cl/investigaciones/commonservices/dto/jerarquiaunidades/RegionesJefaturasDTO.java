package cl.investigaciones.commonservices.dto.jerarquiaunidades;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegionesJefaturasDTO {
    private String nombreRegion;                 // nombre_region
    private java.util.List<Integer> idsNietos;   // todos los idUnidad de la región
    private java.util.List<UnidadHijoDTO> hijos; // jefaturas de la región
}
