package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class FormularioRegistroResponseDTO {
    private Long id;
    private Long formularioId;
    private Integer idFuncionario;
    private LocalDateTime fechaRespuesta;
    private Map<String, Object> datos;
}

