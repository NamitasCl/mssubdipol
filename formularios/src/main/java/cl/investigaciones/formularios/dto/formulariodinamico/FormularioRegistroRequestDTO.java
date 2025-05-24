package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

import java.util.Map;

@Data
public class FormularioRegistroRequestDTO {
    private Long formularioId;          // A qué definición corresponde
    private Map<String, Object> datos;  // Respuestas, ejemplo: { "nombreServicio": "ABC", ... }
}

