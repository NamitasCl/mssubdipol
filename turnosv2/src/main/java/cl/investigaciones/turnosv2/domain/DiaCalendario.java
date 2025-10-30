package cl.investigaciones.turnosv2.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class DiaCalendario {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Calendario calendario;

    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plantilla_id")
    private PlantillaRequerimiento plantillaRequerimiento;
}
