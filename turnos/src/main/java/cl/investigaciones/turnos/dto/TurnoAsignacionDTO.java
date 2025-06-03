// TurnoAsignacionDTO.java
package cl.investigaciones.turnos.dto;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TurnoAsignacionDTO {
    private Long id;
    private int mes;
    private int anio;
    private List<DiaAsignacionDTO> asignaciones;
    private String tipo;
    private String unidadPrincipal;
    private Integer idFuncionario; //Quien creo el registro
    private Integer idUnidad;
}