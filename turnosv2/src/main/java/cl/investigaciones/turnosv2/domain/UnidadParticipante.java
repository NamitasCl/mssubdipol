package cl.investigaciones.turnosv2.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class UnidadParticipante {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String sigla;

}
