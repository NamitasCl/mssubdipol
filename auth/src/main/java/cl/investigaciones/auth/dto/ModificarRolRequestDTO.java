package cl.investigaciones.auth.dto;

import lombok.Data;

import java.util.Set;

@Data
public class ModificarRolRequestDTO {
    private int idFun;
    private Set<String> roles;

    @Override
    public String toString() {
        return "ModificarRolRequestDTO{" +
                "idFun=" + idFun +
                ", roles=" + roles +
                '}';
    }
}

