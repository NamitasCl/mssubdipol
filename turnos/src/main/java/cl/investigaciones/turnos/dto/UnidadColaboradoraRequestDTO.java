// UnidadColaboradoraRequestDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UnidadColaboradoraRequestDTO {
    private String name;
    private String siglasUnidad;
    private int totalPeople;
    private int maxShifts;
    private int workersPerDay;
    private boolean noWeekend; // true = "No trabaja finde", false = "Sí trabaja"
    private int mes;
    private int anio;
}