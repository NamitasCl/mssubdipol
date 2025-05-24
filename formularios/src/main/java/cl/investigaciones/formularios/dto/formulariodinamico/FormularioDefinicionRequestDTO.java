package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

import java.util.List;

@Data
public class FormularioDefinicionRequestDTO {
    private String nombre;
    private String descripcion;
    private List<FormularioCampoDTO> campos;
    private List<FormularioVisibilidadDTO> visibilidad;
}

