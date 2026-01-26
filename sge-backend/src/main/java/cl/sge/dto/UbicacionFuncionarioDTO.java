package cl.sge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO for funcionario location lookup.
 * Answers: "Where is funcionario X deployed right now?"
 */
@Data
@AllArgsConstructor
public class UbicacionFuncionarioDTO {
    private String rut;
    private String nombreFuncionario;
    private String eventoDescripcion;
    private String despliegueDescripcion;
    private String zonaAfectada; // GeoJSON
    private Double latitud;
    private Double longitud;
    private String unidadOrigen;
    private String fechaAsignacion;
}
