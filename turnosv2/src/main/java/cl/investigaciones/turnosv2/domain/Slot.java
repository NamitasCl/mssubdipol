package cl.investigaciones.turnosv2.domain;

import cl.investigaciones.turnosv2.domain.enums.RolServicio;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Slot {

    @Id
    @GeneratedValue
    private Long id;

    private LocalDate fecha;
    private String nombreServicio;

    @Enumerated(EnumType.STRING)
    private RolServicio rolRequerido;

    @ManyToOne
    private Calendario calendario;
}
