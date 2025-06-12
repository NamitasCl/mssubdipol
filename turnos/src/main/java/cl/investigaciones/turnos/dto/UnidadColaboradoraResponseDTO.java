// UnidadColaboradoraResponseDTO.java
package cl.investigaciones.turnos.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UnidadColaboradoraResponseDTO {
    private Long id;
    private String nombreUnidad;
    private String siglasUnidad;
    private int cantFuncAporte;
    private int maxTurnos;
    private int trabajadoresPorDia;
    private boolean trabajaFindesemana;

}