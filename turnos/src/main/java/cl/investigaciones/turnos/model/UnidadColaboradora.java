package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Data
@Getter
@Setter
public class UnidadColaboradora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String siglasUnidad;
    private int cantFuncAporte;
    private int maxTurnos;
    private int trabajadoresPorDia;
    private boolean trabajaFindesemana;

    // Asociación: Cada solicitud se asocia a un registro mensual
    @ManyToOne
    @JoinColumn(name = "turno_asignacion_id")
    private TurnoAsignacion turnoAsignacion;


}