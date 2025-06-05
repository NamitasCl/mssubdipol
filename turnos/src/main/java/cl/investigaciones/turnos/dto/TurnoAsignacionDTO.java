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
    private List<Long> plantillasIds; //Plantillas de turnos elegidas
}