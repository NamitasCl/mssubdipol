package cl.investigaciones.nodos.dto.grafos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NodoDTO {
    private String id;
    private String label;
    private String type;
    private Object data;
}
