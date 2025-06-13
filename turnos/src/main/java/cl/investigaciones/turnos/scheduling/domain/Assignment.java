package cl.investigaciones.turnos.scheduling.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assignment",
        uniqueConstraints = @UniqueConstraint(columnNames = {"shift_slot_id"}))
@Getter @Setter @NoArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_slot_id")
    private ShiftSlot shiftSlot;

    private Long staffId; // funcionario asignado
}