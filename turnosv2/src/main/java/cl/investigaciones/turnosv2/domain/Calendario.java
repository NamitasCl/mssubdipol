package cl.investigaciones.turnosv2.domain;

import cl.investigaciones.turnosv2.domain.enums.EstadoCalendario;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Calendario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private Integer dias;

    @Enumerated(EnumType.STRING)
    private EstadoCalendario estado;

    @OneToMany(mappedBy = "calendario")
    private List<Slot> slotsRequeridos;

    @ManyToMany
    private List<UnidadParticipante> unidadParticipantes;
}
