package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FichaVehiculoResponse {
    private Long id;
    private String patente;
    private String marca;
    private String modelo;
    private String color;
    private String tipo;

    private List<FichaMemoDTO> memos = new ArrayList<>();
}
