package cl.investigaciones.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioActiveDirectoryDTO {
    private String usuarioAD;
    private String runFun;
    private String dvFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private int idFun;
    private String siglasCargo;
    private String apellidoMaternoFun;
    private String nombreUnidad;
    private String nombrePerfil;
    private String siglasUnidad;
    private int idUnidad;
    private String nombreCargo;
    private String emailFun;
    private String antiguedad;


}
