package cl.investigaciones.nodos.dto.serviciosespeciales;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaPersonasRequestDTO {
    private OffsetDateTime fechaInicio;
    private OffsetDateTime fechaFin;
}
