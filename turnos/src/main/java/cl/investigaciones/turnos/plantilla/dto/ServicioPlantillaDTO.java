package cl.investigaciones.turnos.plantilla.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class ServicioPlantillaDTO {
    private String nombreServicio;
    private String turno;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private List<CupoServicioPlantillaDTO> cupos;

    // Nuevo:
    private List<RecintoServicioPlantillaDTO> recintos;
}


