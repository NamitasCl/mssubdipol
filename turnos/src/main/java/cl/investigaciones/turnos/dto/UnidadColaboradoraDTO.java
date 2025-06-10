package cl.investigaciones.turnos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnidadColaboradoraDTO {

    private String name;

    private int totalPeople;
    private int maxShifts;
    private int workersPerDay;
    private boolean noWeekend;

    private int mes;
    private int anio;
    private Long idCalendario;

}
