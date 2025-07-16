package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "listas_calibre", schema = "public")
@Data
@Immutable
public class ListaCalibre {
    @Id
    private Long id;

    @Column(name = "calibre")
    private String calibre;
}
