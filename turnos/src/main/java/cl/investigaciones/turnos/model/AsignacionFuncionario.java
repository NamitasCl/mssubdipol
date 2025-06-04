package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AsignacionFuncionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int idFuncionario;

    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private String unidad;
    private int mes;
    private int anio;
    private String tipoAsignacion; // "UNIDAD" o "COMPLEJO"

    @OneToMany(mappedBy = "identificadorFuncionario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FuncionarioDiasNoDisponible> diasNoDisponibles;

    @ManyToOne TurnoAsignacion turnoAsignacion;

}
