package cl.investigaciones.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DiaAsignadoFuncionarioRequest {

    private Long idFuncionario;
    private LocalDate fecha;

}
