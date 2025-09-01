package cl.investigaciones.nodos.dto.serviciosespeciales;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FichaMemoRequestDTO {
    private LocalDateTime fechaInicioUtc;
    private LocalDateTime fechaTerminoUtc;
    private String tipoMemo;
    private String region;
    private String unidad;
    private List<String> unidades;
    private List<Long> memoIds;
}
