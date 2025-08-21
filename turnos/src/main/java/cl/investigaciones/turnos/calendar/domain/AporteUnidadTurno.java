package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "aporte_unidad_turno")
@Data
public class  AporteUnidadTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idCalendario;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private int cantidadFuncionarios;

    private LocalDateTime fechaRegistro;
    private Integer registradoPor;
}
