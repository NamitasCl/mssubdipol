package cl.investigaciones.turnos.availability.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class AvailabilityRequestDTO {

    @NotNull
    private Long calendarId;

    @NotNull
    private Long staffId;

    @NotNull
    private LocalDate date;

    private String reason;
}