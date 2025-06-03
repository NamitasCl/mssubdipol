package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Data
@Getter
@Setter
public class TurnoAsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes;
    private int anio;

    // Flag para indicar si el mes está abierto o cerrado
    private boolean activo;

    private int cantidadTurnosDiarios;

    private String tipo; //"COMPLEJO" o "UNIDAD"
    private String unidadPrincipal;

    private Integer idFuncionario; //Quien creo el registro
    private Integer idUnidad; //En que unidad se encontraba asignado el funcionario que hizo el registro.

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaAsignacion> asignaciones;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnidadColaboradora> unidadesColaboradoras;

}