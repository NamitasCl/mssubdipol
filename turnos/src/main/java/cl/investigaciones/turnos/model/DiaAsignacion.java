package cl.investigaciones.turnos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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
    private String error; // Opcional, en caso de error

    @ElementCollection
    @CollectionTable(name = "dia_asignacion_unidades", joinColumns = @JoinColumn(name = "dia_asignacion_id"))
    @Column(name = "unidad")
    private List<String> unidades;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_asignacion_id")
    @JsonIgnore
    private TurnoAsignacion turnoAsignacion;

    @OneToMany(mappedBy = "diaAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AsignacionFuncionarioTurno> asignacionesFuncionario;
}