package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

@Data
public class FormularioVisibilidadDTO {
    private String tipoDestino; // "unidad", "usuario", "grupo"
    private String valorDestino; // ej: sigla, id usuario, etc.
    private String valorDestinoNombre; // Texto asociado al codigo guardado
}

