package cl.investigaciones.turnos.plantilla.dto;

import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CupoServicioPlantillaDTO {
    private RolServicio rol;
    private int cantidad;
    private boolean puedeConducir;
}
