package cl.investigaciones.turnos.plantilla.dto;

import cl.investigaciones.turnos.plantilla.domain.TipoServicio;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class ServicioPlantillaDTO {
    private String nombreServicio;
    private TipoServicio tipoServicio;
    private Integer rondaCantidadSemana;
    private Integer rondaCantidadFds;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private List<CupoServicioPlantillaDTO> cupos;

    // Nuevo:
    private List<RecintoServicioPlantillaDTO> recintos;
}


