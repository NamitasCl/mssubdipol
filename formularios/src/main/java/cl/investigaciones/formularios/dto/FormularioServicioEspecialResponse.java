package cl.investigaciones.formularios.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FormularioServicioEspecialResponse {
    private Long id;
    private String regionPolicial;
    private String brigada;
    private String nombreServicio;
    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraTermino;
    private String siglaCarro;
    private Boolean esCorporativo;
    private Integer idJefeMaquina;
    private String telefonoJefeMaquina;
    private LocalDateTime fechaRegistro;
}
