package cl.investigaciones.turnos.calendar.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor
public class UnitQuotaDTO {
    @NotNull
    private Long unitId;

    @Positive
    private int quota;
}