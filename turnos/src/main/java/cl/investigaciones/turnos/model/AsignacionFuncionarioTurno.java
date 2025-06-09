package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Data
public class AsignacionFuncionarioTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreTurno; // Ej: "Jefe de Servicio", "Encargado Primera Guardia..."

    @ManyToOne
    private ServicioDiario servicioDiario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario", referencedColumnName = "id", nullable = false)
    private AsignacionFuncionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dia_asignacion_id")
    private DiaAsignacion diaAsignacion;

    private LocalDate createdAt;
    private LocalDate updatedAt;
    private LocalDate fechaCreacion;
}
