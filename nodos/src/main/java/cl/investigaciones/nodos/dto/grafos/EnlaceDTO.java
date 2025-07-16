package cl.investigaciones.nodos.dto.grafos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EnlaceDTO {
    private String source;
    private String target;
    private String label;
}
