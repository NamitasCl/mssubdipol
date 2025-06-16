package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.*;
import lombok.*;

import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
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
    //Auditable fields
    private int creadoPor;
    private String modificadoPor;
    private String fechaCreacion;
    private String fechaModificacion;
    private String nombreComplejo; // Nombre del complejo asociado, si aplica

}