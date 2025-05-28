package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

@Data
public class CSConsultaFuncionarioResponse {
    private Long id;
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;
    private String username;

}
