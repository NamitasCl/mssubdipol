package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "listas_unidad", schema = "public")
@Data
@Immutable
public class ListaUnidad {

    @Id
    private Long id;

    @Column(name = "nombreUnidad")
    private String nombreUnidad;

    @Column(name = "nombreComuna")
    private String nombreComuna;

    @Column(name = "nombreRegion")
    private String nombreRegion;
}
