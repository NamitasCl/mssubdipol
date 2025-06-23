package cl.investigaciones.turnos.calendar.domain;

import cl.investigaciones.turnos.common.Auditable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "funcionario_aporte")
@Data
public class FuncionarioAporte extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idCalendario; //Calendario al que aporta
    private Long idUnidad; //Unidad que aporta

    // Información del funcionario
    private int idFuncionario;
    private String nombreCompleto;
    private String grado;
    private int antiguedad;

    private boolean disponible = true;


}
