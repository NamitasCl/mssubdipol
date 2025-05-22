// DiaAsignacionDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class DiaAsignacionDTO {
    private int dia;
    private String diaSemana;
    private List<String> unidades;
    private String error; // Opcional

    public int getDia() {
        return dia;
    }

    public void setDia(int dia) {
        this.dia = dia;
    }

    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public List<String> getUnidades() {
        return unidades;
    }

    public void setUnidades(List<String> unidades) {
        this.unidades = unidades;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}