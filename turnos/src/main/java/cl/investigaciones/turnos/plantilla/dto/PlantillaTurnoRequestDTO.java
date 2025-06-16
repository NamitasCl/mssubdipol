package cl.investigaciones.turnos.plantilla.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class PlantillaTurnoRequestDTO {
    private String nombre;
    private String descripcion;
    private List<ServicioPlantillaDTO> servicios;
}
