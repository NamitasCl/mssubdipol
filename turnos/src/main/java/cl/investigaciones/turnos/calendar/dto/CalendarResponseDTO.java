package cl.investigaciones.turnos.calendar.dto;

import cl.investigaciones.turnos.calendar.domain.*;
import lombok.*;

@Getter @Setter @AllArgsConstructor
public class CalendarResponseDTO {
    private Long id;
    private String name;
    private int month;
    private int year;
    private CalendarType type;
    private CalendarState state;
}