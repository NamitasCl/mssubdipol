package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ConsultaUnidadDto {
    private int idUnidad;
    private String nombreUnidad;
    private String siglasUnidad;
    private String nombreComuna;

    public ConsultaUnidadDto(int idUnidad, String nombreUnidad, String siglasUnidad, String nombreComuna) {
    }

    public ConsultaUnidadDto() {
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public String getSiglasUnidad() {
        return siglasUnidad;
    }

    public void setSiglasUnidad(String siglasUnidad) {
        this.siglasUnidad = siglasUnidad;
    }

    public String getNombreComuna() {
        return nombreComuna;
    }

    public void setNombreComuna(String nombreComuna) {
        this.nombreComuna = nombreComuna;
    }

    public int getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(int idUnidad) {
        this.idUnidad = idUnidad;
    }
}
