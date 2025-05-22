package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Data
public class AsignacionFuncionarioTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreTurno; // Ej: "Jefe de Servicio", "Encargado Primera Guardia..."

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario", referencedColumnName = "id", nullable = false)
    private AsignacionFuncionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dia_asignacion_id")
    private DiaAsignacion diaAsignacion;
}
