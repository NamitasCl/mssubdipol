package cl.investigaciones.nodos.dto.serviciosespeciales;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FichaMemoRequestDTO {
    private LocalDateTime fechaInicioUtc;
    private LocalDateTime fechaTerminoUtc;
    private String region;
    private String unidad;
}
