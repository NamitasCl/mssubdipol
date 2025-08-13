package cl.investigaciones.auth.dto;

import lombok.Data;

import java.util.List;

@Data
public class FuncionarioConRolesDTO {
    private String nombreCompleto;
    private Integer idFuncionario;
    private List<String> roles;
}
