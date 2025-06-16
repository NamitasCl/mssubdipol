package cl.investigaciones.turnos.plantilla.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlantillaTurnoResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private List<ServicioPlantillaDTO> servicios;
}

