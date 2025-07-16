package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiaNoDisponibleGlobalResponse {
    private Integer idFuncionario;
    List<DiaNoDisponibleGlobalDTO> dias = new ArrayList<>();
}
