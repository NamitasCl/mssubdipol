package cl.investigaciones.turnos.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity(name = "func_dias_no_disponible")
@Getter
@Setter
public class FuncionarioDiasNoDisponible {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private String motivo;
    private String detalle;

    @ManyToOne
    @JoinColumn(name = "id_funcionario", referencedColumnName = "id", nullable = false)
    private AsignacionFuncionario identificadorFuncionario;


}
