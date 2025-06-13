package cl.investigaciones.turnos.scheduling.domain;

import cl.investigaciones.turnos.calendar.domain.Calendar;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "shift_slot")
@Getter @Setter @NoArgsConstructor
public class ShiftSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id")
    private Calendar calendar;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private ShiftRole role;   // DAY o NIGHT

    /**
     * TRUE si este slot corresponde al Jefe de Servicio.
     * Los demás (Encargado, Ayudante, Refuerzo) tienen el flag en FALSE.
     */
    private boolean chief;

    // para complejos: unidad responsable (opcional)
    private Long unitId;

    @OneToOne(mappedBy = "shiftSlot", cascade = CascadeType.ALL)
    private Assignment assignment; // nullo hasta que se genera

    /* -------------------------------------------------- */
    /** Conveniencia para restricciones: devuelve el staff asignado (o null). */
    public Long getStaffId() {
        return assignment != null ? assignment.getStaffId() : null;
    }
}