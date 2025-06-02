// src/main/java/cl/investigaciones/formularios/dto/formulariodinamico/AsignacionCuotaFormularioDTO.java
package cl.investigaciones.formularios.dto.formulariodinamico;

import lombok.Data;

@Data
public class AsignacionCuotaFormularioDTO {
    private Long id;
    private Long formularioId;
    private Integer idUnidad;         // Unidad/persona responsable (puedes extender a idFuncionario si lo necesitas)
    private Integer cuotaAsignada;
    private Long cuotaPadreId;        // null si es raíz, set si fue delegada
    private Integer idFuncionario;
    private Integer avance;
    private String nombreUnidad;
    private String nombreFuncionario;
}