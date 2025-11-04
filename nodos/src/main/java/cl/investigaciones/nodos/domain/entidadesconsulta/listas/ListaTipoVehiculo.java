package cl.investigaciones.nodos.domain.entidadesconsulta.listas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "listas_tipovehiculo", schema = "public")
@Data
@Immutable
public class ListaTipoVehiculo {

    @Id
    private Long id;

    @Column(name = "tipoVehiculo")
    private String tipoVehiculo;
}
