package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class ConfiguracionRestriccionesCalendarioDTO {
    private JsonNode parametrosJson;
}

