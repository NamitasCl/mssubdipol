package cl.investigaciones.turnos.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class MesResumenDTO {
    private int mes;
    private int anio;
    private List<UnidadResumenDTO> unidades;
    private String nombreCalendario;
    private int idFuncionario;
}
