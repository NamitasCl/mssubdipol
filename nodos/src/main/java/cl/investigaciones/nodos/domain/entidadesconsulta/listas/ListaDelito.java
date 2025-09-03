package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "listas_delitos", schema = "public")
@org.hibernate.annotations.Immutable
@Data
public class ListaDelito {
    @Id
    private Long id;

    @Column(name = "delito")
    private String delito;

    // lado inverso (opcional)
    @ManyToMany(mappedBy = "delitos")
    @org.hibernate.annotations.Immutable
    private java.util.Set<FichaPersona> personas = java.util.Collections.emptySet();
}
