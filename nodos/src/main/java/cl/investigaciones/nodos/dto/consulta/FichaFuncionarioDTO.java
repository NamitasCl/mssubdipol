package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

@Data
public class FichaFuncionarioDTO {
    private Long id;
    private String funcionario;
    private String responsabilidadMemo;
}
