package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_dineros", schema = "public")
@Data
@Immutable
public class FichaDinero {

    @Id
    private Long id;

    @Column(name = "\"calidad\"")
    private String calidad;

    @Column(name = "\"monto\"")
    private Double monto;

    @Column(name = "\"obs\"")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;
}
