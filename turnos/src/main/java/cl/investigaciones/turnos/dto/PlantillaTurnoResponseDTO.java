// PlantillaTurnoResponseDTO.java
package cl.investigaciones.turnos.dto;

import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;

public class PlantillaTurnoResponseDTO {
    public Long id;
    public String nombre;
    public String descripcion;
    public String tipoServicio;
    public LocalTime horaInicio;
    public LocalTime horaFin;
    public int cantidadFuncionarios;
    public List<DayOfWeek> dias;
    public List<String> restricciones;
    public List<String> gradosPermitidos;
}