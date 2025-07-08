package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_dineros")
@Data
@Immutable
public class FichaDineros {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "calidad")
    private String calidad;

    @Column(name = "monto")
    private Double monto;

    @Column(name = "obs")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;
}
