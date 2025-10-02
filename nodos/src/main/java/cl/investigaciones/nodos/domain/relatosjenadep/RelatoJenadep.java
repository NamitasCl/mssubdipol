package cl.investigaciones.nodos.domain.relatosjenadep;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "relato_jenadep", schema = "nodos")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RelatoJenadep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unidad")
    private String unidad;

    @Column(name = "lugar")
    private String lugar;

    @Column(name = "fecha")
    private OffsetDateTime fecha;

    @Column(name = "hecho")
    private String hecho;

    @Column(name = "relato")
    private String relato;

    @Column(name = "memo")
    private Long memo;
}
