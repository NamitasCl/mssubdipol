package cl.investigaciones.turnos.scheduling.dto;

import cl.investigaciones.turnos.scheduling.domain.ShiftRole;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @AllArgsConstructor
public class AssignmentDTO {
    private Long shiftSlotId;
    private Long staffId;
    private LocalDate date;
    private ShiftRole role;
}