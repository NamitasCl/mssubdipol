package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class ActualizacionTurnoUnidadWrapper {
    private List<ActualizacionTurnoUnidadDTO> actualizaciones;
}
