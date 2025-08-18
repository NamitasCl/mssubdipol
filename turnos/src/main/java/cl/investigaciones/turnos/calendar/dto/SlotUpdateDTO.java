package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotUpdateDTO {
    private Long id;
    private LocalDate fecha;
    private Integer idFuncionario;
    private String nombreFuncionario;
    private String gradoFuncionario;
    private String siglasUnidadFuncionario;
    private Boolean cubierto;
}