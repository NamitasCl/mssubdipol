package cl.investigaciones.turnos.dto;

import lombok.Data;

@Data
public class CSFuncionarioUnidadResponseDTO {
    private Long id;
    private Integer idFun;
    private Integer antiguedad;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;

    public String getNombreCompleto() {
        return nombreFun + " " + apellidoPaternoFun + " " + apellidoMaternoFun;
    }
}
