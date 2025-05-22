// TurnosResponseDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

@Data
public class TurnosResponseDTO {
    private int cantidadTurnos;

    public int getCantidadTurnos() {
        return cantidadTurnos;
    }

    public void setCantidadTurnos(int cantidadTurnos) {
        this.cantidadTurnos = cantidadTurnos;
    }
}