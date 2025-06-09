package cl.investigaciones.turnos.dto;

import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;

public class PlantillaTurnoRequestDTO {
    public String nombre;
    public String descripcion;
    public String tipoServicio;
    public LocalTime horaInicio;
    public LocalTime horaFin;
    public List<RolPlantillaDTO> roles;
    public List<DayOfWeek> dias;
    public List<String> restricciones;
}
