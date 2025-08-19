package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class FuncionarioAporteResponseDTO {
    private Long id;
    private Long idCalendario;
    private Long idUnidad;
    private int idFuncionario;
    private String nombreCompleto;
    private String siglasUnidad;
    private String grado;
    private int antiguedad;
    private Integer creadoPor; // ID del usuario que creó el registro
    private OffsetDateTime fechaCreacion;
    private boolean disponible;
    private List<DiaNoDisponibleDTO> diasNoDisponibles;
}

