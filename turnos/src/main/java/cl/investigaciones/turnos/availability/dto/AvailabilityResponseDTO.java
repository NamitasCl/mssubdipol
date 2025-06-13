package cl.investigaciones.turnos.availability.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @AllArgsConstructor
public class AvailabilityResponseDTO {
    private Long id;
    private Long calendarId;
    private Long staffId;
    private LocalDate date;
    private String reason;
}