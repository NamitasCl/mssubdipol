package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FuncionarioPorUnidadDTO {

    private Long id;
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;
    private int antiguedad;

    public String getNombreCompleto() {
        return nombreFun + " " + apellidoPaternoFun + " " + apellidoMaternoFun;
    }

}
