package cl.investigaciones.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FuncionariosDisponiblesResponseDTO {
    private Long id;
    private int idFuncionario;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private String unidad;

}
