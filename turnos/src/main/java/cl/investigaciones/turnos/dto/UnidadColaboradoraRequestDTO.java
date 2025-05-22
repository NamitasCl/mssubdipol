// UnidadColaboradoraRequestDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

@Data
public class UnidadColaboradoraRequestDTO {
    private String name;
    private int totalPeople;
    private int maxShifts;
    private int workersPerDay;
    private boolean noWeekend; // true = "No trabaja finde", false = "Sí trabaja"
    private int mes;
    private int anio;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTotalPeople() {
        return totalPeople;
    }

    public void setTotalPeople(int totalPeople) {
        this.totalPeople = totalPeople;
    }

    public int getMaxShifts() {
        return maxShifts;
    }

    public void setMaxShifts(int maxShifts) {
        this.maxShifts = maxShifts;
    }

    public int getWorkersPerDay() {
        return workersPerDay;
    }

    public void setWorkersPerDay(int workersPerDay) {
        this.workersPerDay = workersPerDay;
    }

    public boolean isNoWeekend() {
        return noWeekend;
    }

    public void setNoWeekend(boolean noWeekend) {
        this.noWeekend = noWeekend;
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
}