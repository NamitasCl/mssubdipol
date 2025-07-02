package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
public class CalendarioResponseDTO {
    private Long id;
    private String nombre;
    private int mes;
    private int anio;
    private CalendarType tipo;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private List<Long> idPlantillasUsadas;
    private CalendarState estado;
    private boolean eliminado;
    private List<AporteUnidadTurnoResponseDTO>  aporteUnidadTurnos;
    //Auditable fields
    private Integer creadoPor;
    private Integer modificadoPor;
    private String fechaCreacion;
    private String fechaModificacion;
    private String nombreComplejo; // Nombre del complejo asociado, si aplica

}