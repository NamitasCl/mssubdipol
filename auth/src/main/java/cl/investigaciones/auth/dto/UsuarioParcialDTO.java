package cl.investigaciones.auth.dto;

import lombok.Data;

@Data
public class UsuarioParcialDTO {
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;
}
