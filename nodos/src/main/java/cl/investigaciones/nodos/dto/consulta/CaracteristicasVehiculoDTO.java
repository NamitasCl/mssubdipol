package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

@Data
public class CaracteristicasVehiculoDTO {
    private String marca;
    private String modelo;
    private String color;
    private String anio;
    private String vin;
}
