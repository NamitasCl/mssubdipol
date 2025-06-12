package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AsignacionFuncionario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int idFuncionario;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private String unidad;

    @OneToMany(mappedBy = "asignacionFuncionario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FuncionarioDiasNoDisponible> diasNoDisponibles = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_asignacion_id")
    private TurnoAsignacion turnoAsignacion;
}

