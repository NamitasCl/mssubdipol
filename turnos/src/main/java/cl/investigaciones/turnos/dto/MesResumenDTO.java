package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class MesResumenDTO {
    private int mes;
    private int anio;
    private List<UnidadResumenDTO> unidades;

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public List<UnidadResumenDTO> getUnidades() {
        return unidades;
    }

    public void setUnidades(List<UnidadResumenDTO> unidades) {
        this.unidades = unidades;
    }
}
