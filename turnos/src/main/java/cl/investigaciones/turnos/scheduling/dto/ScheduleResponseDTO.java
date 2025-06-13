package cl.investigaciones.turnos.scheduling.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @AllArgsConstructor
public class ScheduleResponseDTO {
    private Long calendarId;
    private List<AssignmentDTO> assignments;
}