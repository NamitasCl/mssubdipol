package cl.investigaciones.turnos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class DiaAsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int dia;
    private String diaSemana;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_asignacion_id")
    @JsonIgnore
    private TurnoAsignacion turnoAsignacion;

    @OneToMany(mappedBy = "diaAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AsignacionFuncionarioTurno> asignacionesFuncionario;

    @OneToMany(mappedBy = "diaAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServicioDiario> servicios = new ArrayList<>();

}