package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "listas_modelos", schema = "public")
@Data
@Immutable
public class ListaModelo {

    @Id
    private Long id;

    @Column(name = "modelo")
    private String modelo;


}
