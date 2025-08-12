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

    private LocalTime rondaLvInicio;
    private LocalTime rondaLvFin;
    private LocalTime rondaFdsDiaInicio;
    private LocalTime rondaFdsDiaFin;
    private LocalTime rondaFdsNocheInicio;
    private LocalTime rondaFdsNocheFin;

    private List<CupoServicioPlantillaDTO> cupos;

    // Nuevo:
    private List<RecintoServicioPlantillaDTO> recintos;
}


