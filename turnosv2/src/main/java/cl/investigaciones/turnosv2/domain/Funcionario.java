package cl.investigaciones.turnosv2.domain;

import cl.investigaciones.turnosv2.domain.enums.Grado;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

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

    // --- SUGERENCIA ---
    // Días que este funcionario NO PUEDE trabajar
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "funcionario_dias_no_disponibles", joinColumns = @JoinColumn(name = "funcionario_id"))
    private Set<LocalDate> diasNoDisponibles = Set.of();

}
