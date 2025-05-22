// TurnoAsignacionDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class TurnoAsignacionDTO {
    private Long id;
    private int mes;
    private int anio;
    private List<DiaAsignacionDTO> asignaciones;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<DiaAsignacionDTO> getAsignaciones() {
        return asignaciones;
    }

    public void setAsignaciones(List<DiaAsignacionDTO> asignaciones) {
        this.asignaciones = asignaciones;
    }
}