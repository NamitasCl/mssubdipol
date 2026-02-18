package cl.investigaciones.turnos.calendar.domain;

import cl.investigaciones.turnos.common.Auditable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Entidad que representa una solicitud de cambio de turno.
 * Un funcionario puede solicitar cambiar su turno por:
 * - PERMUTA: Intercambio con otro funcionario
 * - DEVOLUCION: El reemplazo devolverá el favor en el futuro
 * - CESION: Sin devolución
 */
@Entity
@Table(name = "solicitud_cambio_turno")
@Data
@EqualsAndHashCode(callSuper = false)
public class SolicitudCambioTurno extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Slot que el solicitante quiere cambiar
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_slot_original")
    private Slot slotOriginal;

    // Slot por el que se cambia (en caso de permuta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_slot_reemplazo")
    private Slot slotReemplazo;

    // Funcionario que solicita el cambio
    private Integer idFuncionarioSolicitante;
    private String nombreFuncionarioSolicitante;

    // Funcionario que toma el turno
    private Integer idFuncionarioReemplazo;
    private String nombreFuncionarioReemplazo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCambio tipoCambio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(length = 500)
    private String motivo;

    @Column(length = 500)
    private String observacionAprobador;

    // Quien aprueba/rechaza
    private Integer idAprobador;
    private String nombreAprobador;

    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaResolucion;

    // Referencia al calendario para facilitar consultas
    private Long idCalendario;

    @PrePersist
    public void prePersist() {
        if (fechaSolicitud == null) {
            fechaSolicitud = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE;
        }
    }
}
