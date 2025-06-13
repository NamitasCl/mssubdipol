package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.CalendarType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class CalendarRequestDTO {

    @NotBlank
    private String name;

    @Min(1) @Max(12)
    private int month;

    @Min(2023)
    private int year;

    private CalendarType type = CalendarType.UNIT;

    /* Quotas opcionales si es COMPLEX */
    private List<UnitQuotaDTO> quotas;
}