package cl.investigaciones.formularios.dto;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JwtUserPrincipal {

    private String username;
    private String nombreUsuario;
    private String siglasUnidad;
    private List<String> roles;
    private int idFuncionario;

    @Override
    public String toString() {
        return "JwtUserPrincipal [username=" + username + ", nombreUsuario=" + nombreUsuario + ", siglasUnidad=" + siglasUnidad + ", roles=" + roles + "]";
    }
}
