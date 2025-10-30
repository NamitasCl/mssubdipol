package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.Asignacion;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AsignacionDTO {

    // Datos "aplanados" que el frontend necesita
    private Long id;
    private LocalDate fecha;
    private String rolRequerido;
    private String nombreFuncionario;
    private String gradoFuncionario;

    // Constructor para mapear fácil
    public AsignacionDTO(Asignacion asignacion) {
        this.id = asignacion.getId();
        this.fecha = asignacion.getSlot().getFecha();
        this.rolRequerido = asignacion.getSlot().getRolRequerido().getDescripcion();

        if (asignacion.getFuncionario() != null) {
            this.nombreFuncionario = asignacion.getFuncionario().getNombres() + " " + asignacion.getFuncionario().getApellidoPaterno();
            this.gradoFuncionario = asignacion.getFuncionario().getGrado().getDescripcion();
        } else {
            this.nombreFuncionario = "SIN ASIGNAR";
            this.gradoFuncionario = "N/A";
        }
    }
}