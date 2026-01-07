package cl.investigaciones.turnos.calendar.domain;

import cl.investigaciones.turnos.common.Auditable;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "calendario")
@Data
public class Calendario extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private int mes;
    private int anio;
    @Enumerated(EnumType.STRING)
    private CalendarType tipo;
    @Enumerated(EnumType.STRING)
    private CalendarState estado = CalendarState.ABIERTO;
    private boolean eliminado = false;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private String nombreComplejo; // Nombre del complejo asociado, si aplica
    @ElementCollection
    private List<Long> idPlantillasUsadas;

    @OneToOne(mappedBy = "calendario")
    private ConfiguracionRestriccionesCalendario configuracionRestricciones;

    // --- Datos de Revisión ---
    private String revisadoPor; // Username del revisor
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private java.time.OffsetDateTime fechaRevision;
    private String observacionRevision;
    
}