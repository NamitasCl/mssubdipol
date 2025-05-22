package cl.investigaciones.turnos.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadResumenDTO {

    private String unidad;
    private int cantidadPersonasNecesarias;

    public String getUnidad() {
        return unidad;
    }

    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }

    public int getCantidadPersonasNecesarias() {
        return cantidadPersonasNecesarias;
    }

    public void setCantidadPersonasNecesarias(int cantidadPersonasNecesarias) {
        this.cantidadPersonasNecesarias = cantidadPersonasNecesarias;
    }
}
