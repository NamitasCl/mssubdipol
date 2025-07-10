package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

@Data
public class FichaDrogaDTO {
    private Long id;
    private String tipoDroga;
    private String unidadMedida;
    private Double cantidadDroga;
    private String obs;
}
