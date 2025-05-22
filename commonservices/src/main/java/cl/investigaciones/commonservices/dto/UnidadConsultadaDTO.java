package cl.investigaciones.commonservices.dto;

public class UnidadConsultadaDTO {
    private String unidad;

    public UnidadConsultadaDTO() {}

    public UnidadConsultadaDTO(String unidad) {
        this.unidad = unidad;
    }

    public String getUnidad() {
        return unidad;
    }

    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }
}
