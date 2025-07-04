package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "configuracion_restricciones_calendario")
@Getter
@Setter
public class ConfiguracionRestriccionesCalendario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_calendario")
    private Calendario calendario;

    // El JSONB donde se guardan todas las restricciones y sus valores
    @Column(columnDefinition = "jsonb")
    private String parametrosJson;

}
