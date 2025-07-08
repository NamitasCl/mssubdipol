package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_armas")
@Data
@Immutable
public class FichaArmas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "marcaArma")
    private String marcaArma;

    @Column(name = "serieArma")
    private String serieArma;

    @Column(name = "calidad")
    private String calidad; //Aqui puede ser INCAUTADO, SUSTRAIDO, ETC

    @Column(name = "condicion")
    private String condicion; //ARMA TRADICIONAL o ARMA MODIFICADA

    @Column(name = "obs")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;

}
