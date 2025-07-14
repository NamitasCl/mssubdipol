package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.util.List;

@Data
public class DiaNoDisponibleGlobalRequest {
    public Integer idFuncionario;
    public List<DiaNoDisponibleGlobalDTO> dias;
}
