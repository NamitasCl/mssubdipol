package cl.investigaciones.formularios.dto;

import cl.investigaciones.formularios.model.FormularioServicioEspecial;
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


    public static FormularioServicioEspecialResponse fromEntity(FormularioServicioEspecial entity) {
        FormularioServicioEspecialResponse dto = new FormularioServicioEspecialResponse();
        dto.setId(entity.getId());
        dto.setRegionPolicial(entity.getRegionPolicial());
        dto.setBrigada(entity.getBrigada());
        dto.setNombreServicio(entity.getNombreServicio());
        dto.setFechaHoraInicio(entity.getFechaHoraInicio());
        dto.setFechaHoraTermino(entity.getFechaHoraTermino());
        dto.setSiglaCarro(entity.getSiglaCarro());
        dto.setEsCorporativo(entity.getEsCorporativo());
        dto.setIdJefeMaquina(entity.getIdJefeMaquina());
        dto.setTelefonoJefeMaquina(entity.getTelefonoJefeMaquina());
        // ... set otros campos si tienes
        return dto;
    }
}
