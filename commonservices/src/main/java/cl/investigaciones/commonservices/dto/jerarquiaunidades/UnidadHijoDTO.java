package cl.investigaciones.commonservices.dto.jerarquiaunidades;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnidadHijoDTO {
    private String nombreHijo;                // nombreUnidadReporta (jefatura)
    private java.util.List<Integer> idsAsociados; // ids de sus nietos
    private java.util.List<UnidadNietoDto> nietos;
}
