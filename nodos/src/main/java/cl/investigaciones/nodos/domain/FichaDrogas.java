package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_drogas")
@Data
@Immutable
public class FichaDrogas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "droga")
    private String tipoDroga;

    @Column(name = "unidadMasa")
    private String unidadMedida;

    @Column(name = "cantidadDrog")
    private Double cantidadDroga;

    @Column(name = "obs")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;
}
