package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FuncionariosAportadosPaginados {
    private Long id;
    private String nombreCompleto;
}
