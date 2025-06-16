package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servicio_plantilla")
@Data
public class ServicioPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreServicio; //Guardia Principal, Guardia Prevención, etc
    private int cantidadRecintos; //Cantidad de recintos donde se hacen guardias
    private String turno; //Tipo de turno: Dia, Noche, 12h, 24h, etc.
    private LocalTime horaInicio; //Hora inicio turno
    private LocalTime horaFin; //Hora fin turno

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "servicio_plantilla_id")
    private List<CupoServicioPlantilla> cupos = new ArrayList<>();

}
