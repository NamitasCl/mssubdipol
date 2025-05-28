package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FuncionarioByIdFunRespDTO {
    private Long id;
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;
    private String username;

    @Override
    public String toString() {
        return "FuncionarioByIdFunRespDTO{" +
                "id=" + id +
                ", idFun=" + idFun +
                ", nombreFun='" + nombreFun + '\'' +
                ", apellidoPaternoFun='" + apellidoPaternoFun + '\'' +
                ", apellidoMaternoFun='" + apellidoMaternoFun + '\'' +
                ", siglasCargo='" + siglasCargo + '\'' +
                ", siglasUnidad='" + siglasUnidad + '\'' +
                '}';
    }
}
