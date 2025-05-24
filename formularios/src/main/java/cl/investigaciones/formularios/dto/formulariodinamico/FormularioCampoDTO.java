package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

@Data
public class FormularioCampoDTO {
    private String nombre;
    private String etiqueta;
    private String tipo; // "text", "select", "date", "boolean", etc.
    private Boolean requerido;
    private String opciones; // JSON o separado por coma para selects/radios
    private Integer orden;
}

