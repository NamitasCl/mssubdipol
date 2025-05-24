package cl.investigaciones.formularios.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FormularioPermisosDto {
    private List<String> usuarios;
    private List<String> roles;
    private List<String> unidades;
    private List<String> grupos;
}

