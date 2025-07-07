package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import lombok.Data;

@Data
public class SlotsResponseDTO {
    private Long id;
    private Long idCalendario;
    private String fecha;
    private String nombreServicio;
    private RolServicio rolRequerido;
    private int recinto; // opcional: si quieres diferenciar por cantidadRecintos
    private boolean cubierto = false;
    private Integer idFuncionario;
    private String gradoFuncionario;
    private String nombreFuncionario; // se rellena más tarde
    private Integer antiguedadFuncionario; // se rellena más tarde
}
