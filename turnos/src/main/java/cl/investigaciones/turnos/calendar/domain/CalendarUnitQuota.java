package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "calendar_unit_quota",
        uniqueConstraints = @UniqueConstraint(columnNames = {"calendar_id", "unit_id"}))
@Getter @Setter @NoArgsConstructor
public class CalendarUnitQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id")
    private Calendar calendar;

    private Long unitId; // referencia a la Unidad (microservicio de personal)

    private int quota;   // número de personas que debe aportar
}