package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_persona_delitosP", schema = "public")
@Data
@Immutable
public class FichaPersonaDelito {

    @Id
    private Long id;

    @Column(name = "\"persona_id\"")
    private Long personaId;

    @Column(name = "delitos_id")
    private Long delitosId;


}
