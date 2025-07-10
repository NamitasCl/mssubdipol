package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_municiones", schema = "public")
@Data
@Immutable
public class FichaMunicion {

    @Id
    private Long id;

    @Column(name = "\"obs\"")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;

}
