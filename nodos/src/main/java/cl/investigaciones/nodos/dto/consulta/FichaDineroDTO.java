package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

@Data
public class FichaDineroDTO {
    private Long id;
    private String calidad;
    private Double monto;
    private String obs;

}
