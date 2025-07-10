package cl.investigaciones.nodos.dto.grafos;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class GrafoDTO {
    private List<NodoDTO> nodes = new ArrayList<>();
    private List<EnlaceDTO> links = new ArrayList<>();
}
