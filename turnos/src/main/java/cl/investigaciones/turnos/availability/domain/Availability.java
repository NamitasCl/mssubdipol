package cl.investigaciones.turnos.availability.domain;

import cl.investigaciones.turnos.calendar.domain.Calendar;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "availability",
        uniqueConstraints = @UniqueConstraint(columnNames = {"calendar_id", "staff_id", "date"}))
@Getter @Setter @NoArgsConstructor
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // — relación con el calendario —
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id")
    private Calendar calendar;

    // ID del funcionario (viene del microservicio Personal)
    @Column(name = "staff_id")
    private Long staffId;

    private LocalDate date;

    private String reason; // opcional (licencia, feriado, permiso…)
}