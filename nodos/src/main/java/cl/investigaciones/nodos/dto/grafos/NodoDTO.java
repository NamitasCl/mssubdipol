package cl.investigaciones.nodos.dto.grafos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NodoDTO {
    private String id;
    private String label;
    private String type;
}
