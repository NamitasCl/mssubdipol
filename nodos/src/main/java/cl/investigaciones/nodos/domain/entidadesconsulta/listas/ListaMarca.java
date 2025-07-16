package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "listas_marcas", schema = "public")
@Data
@Immutable
public class ListaMarca {

    @Id
    private Long id;

    @Column(name = "marca")
    private String marca;

}
