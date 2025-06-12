package cl.investigaciones.turnos.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadResumenDTO {

    private String siglasUnidad;
    private int cantidadPersonasNecesarias;

}
