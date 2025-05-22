package cl.investigaciones.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class UsuarioSubjefeDTO {
    private String username;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCargo;
    private String siglasUnidad;
    private int idFun;

    public UsuarioSubjefeDTO() {}

    public UsuarioSubjefeDTO(String username, String nombre, String apellidoPaterno, String apellidoMaterno, String nombreCargo, String siglasUnidad, int idFun) {
        this.username = username;
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
        this.nombreCargo = nombreCargo;
        this.siglasUnidad = siglasUnidad;
        this.idFun = idFun;
    }

}
