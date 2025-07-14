package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.CalendarType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class CalendarioRequestDTO {

    private String nombre;
    private int mes;
    private int anio;
    private CalendarType tipo;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private List<Long> idPlantillasUsadas;
    private String nombreComplejo; // Nombre del complejo asociado, si aplica
    private ConfiguracionRestriccionesCalendarioDTO configuracionCalendario;
}