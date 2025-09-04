package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_persona_estadoP", schema = "public")
@Data
@Immutable
public class FichaEstadoPersona {
    @Id
    private Long id;

    @Column(name = "\"persona_id\"")
    private Long personaId;

    @Column(name = "calidadpersona_id")
    private Long calidadpersonaId;
}
