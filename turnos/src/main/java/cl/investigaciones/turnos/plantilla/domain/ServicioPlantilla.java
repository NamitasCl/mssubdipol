package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un servicio dentro de una plantilla de turnos.
 * Un servicio puede tener múltiples cupos y estar asociado a varios recintos.
 * */

@Entity
@Table(name = "servicio_plantilla")
@Data
public class ServicioPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String nombreServicio; //Guardia Principal, Guardia Prevención, etc

    @Enumerated(EnumType.STRING)
    private TipoServicio tipoServicio; //Tipo de servicio: Guardia, Conducción, etc.

    private LocalTime horaInicio; //Hora inicio turno
    private LocalTime horaFin; //Hora fin turno

    private Integer rondaCantidadSemana; //Cantidad de rondas por semana
    private Integer rondaCantidadFds; //Cantidad de rondas por fin de semana

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "servicio_plantilla_id")
    private List<CupoServicioPlantilla> cupos = new ArrayList<>();

    @OneToMany(mappedBy = "servicioPlantilla", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecintoServicioPlantilla> recintos = new ArrayList<>();

}
