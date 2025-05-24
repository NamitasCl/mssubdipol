package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FormularioDefinicionResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private List<FormularioCampoDTO> campos;
    private List<FormularioVisibilidadDTO> visibilidad;
    private boolean activo;
    private LocalDateTime fechaCreacion;
}

