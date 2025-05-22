// UnitAssignmentDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class UnitAssignmentDTO {
    private Long id;           // ID del registro de "unidad" o algo similar
    private String unitName;   // Nombre de la unidad
    private int required;      // Cantidad requerida (cantidadTurnos / 2)
    private List<String> assigned; // Lista de funcionarios
}
