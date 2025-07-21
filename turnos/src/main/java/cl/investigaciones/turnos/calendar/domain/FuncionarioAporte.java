package cl.investigaciones.turnos.calendar.domain;

import cl.investigaciones.turnos.common.Auditable;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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
    private Integer idFuncionario;
    private String nombreCompleto;
    private String grado;
    private Integer antiguedad;
    private String siglasUnidad;

    private boolean disponible = true;

    @OneToMany(mappedBy = "funcionarioAporte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FuncionarioAportadoDiasNoDisponible> diasNoDisponibles = new ArrayList<>();



}
