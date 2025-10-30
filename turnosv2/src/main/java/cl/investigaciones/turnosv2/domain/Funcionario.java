package cl.investigaciones.turnosv2.domain;

import cl.investigaciones.turnosv2.domain.enums.Grado;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Funcionario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String siglaUnidadPertenece;

    @Enumerated(EnumType.STRING)
    private Grado grado;

    private Integer antiguedad;

}
