// UnidadColaboradoraResponseDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

@Data
public class UnidadColaboradoraResponseDTO {
    private Long id;
    private String nombreUnidad;
    private int cantFuncAporte;
    private int maxTurnos;
    private int trabajadoresPorDia;
    private boolean trabajaFindesemana;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public int getCantFuncAporte() {
        return cantFuncAporte;
    }

    public void setCantFuncAporte(int cantFuncAporte) {
        this.cantFuncAporte = cantFuncAporte;
    }

    public int getMaxTurnos() {
        return maxTurnos;
    }

    public void setMaxTurnos(int maxTurnos) {
        this.maxTurnos = maxTurnos;
    }

    public int getTrabajadoresPorDia() {
        return trabajadoresPorDia;
    }

    public void setTrabajadoresPorDia(int trabajadoresPorDia) {
        this.trabajadoresPorDia = trabajadoresPorDia;
    }

    public boolean isTrabajaFindesemana() {
        return trabajaFindesemana;
    }

    public void setTrabajaFindesemana(boolean trabajaFindesemana) {
        this.trabajaFindesemana = trabajaFindesemana;
    }
}