package cl.investigaciones.turnos.calendar.domain;

import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "slot")
@Data
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idCalendario;
    private LocalDate fecha;

    private String nombreServicio;

    @Enumerated(EnumType.STRING)
    private RolServicio rolRequerido;

    private String recinto; // opcional: si quieres diferenciar por cantidadRecintos

    private boolean cubierto = false;

    private Integer idFuncionario;
    private String gradoFuncionario;
    private String nombreFuncionario; // se rellena más tarde
    private Integer antiguedadFuncionario; // se rellena más tarde
    private String siglasUnidadFuncionario; // se rellena más tarde
}

