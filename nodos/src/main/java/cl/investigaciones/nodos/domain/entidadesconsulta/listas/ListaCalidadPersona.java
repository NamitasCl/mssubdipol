package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "listas_calidadpersona", schema = "public")
@org.hibernate.annotations.Immutable
@Data
@EqualsAndHashCode(exclude = {"personas"})
public class ListaCalidadPersona {

    @Id
    private Long id;

    @Column(name = "calidadP")
    private String calidad;


}
