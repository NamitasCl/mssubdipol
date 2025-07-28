package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "dias_no_disponible_funcionario_aporte")
@Data
public class FuncionarioAportadoDiasNoDisponible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el funcionario aportado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_aporte_id")
    private FuncionarioAporte funcionarioAporte;

    // Relación con el calendario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendario_id")
    private Calendario calendario;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private String motivo;

    private String detalle; // solo si motivo == "Otro"
}


