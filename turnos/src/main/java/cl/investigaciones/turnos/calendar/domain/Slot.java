package cl.investigaciones.turnos.calendar.domain;

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
    private String rolRequerido;
    private int recinto; // opcional: si quieres diferenciar por cantidadRecintos

    private boolean cubierto = false;

    private Long idFuncionarioAsignado; // se rellena más tarde
}

