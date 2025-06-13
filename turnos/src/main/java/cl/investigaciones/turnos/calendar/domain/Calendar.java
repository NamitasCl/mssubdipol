package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "calendar")
@Getter @Setter @NoArgsConstructor
public class Calendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int month;  // 1‑12
    private int year;   // YYYY

    @Enumerated(EnumType.STRING)
    private CalendarType type;

    @Enumerated(EnumType.STRING)
    private CalendarState state = CalendarState.OPEN;

    /* --- Relaciones --- */

    @OneToMany(mappedBy = "calendar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CalendarUnitQuota> quotas = new ArrayList<>();

    // utilidades convenientes
    public void addQuota(CalendarUnitQuota quota) {
        quota.setCalendar(this);
        this.quotas.add(quota);
    }
}