package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.EstadoSolicitud;
import cl.investigaciones.turnos.calendar.domain.SolicitudCambioTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudCambioRepository extends JpaRepository<SolicitudCambioTurno, Long> {

    // Solicitudes por funcionario solicitante
    List<SolicitudCambioTurno> findByIdFuncionarioSolicitanteOrderByFechaSolicitudDesc(Integer idFuncionario);

    // Solicitudes pendientes para un calendario
    List<SolicitudCambioTurno> findByIdCalendarioAndEstadoOrderByFechaSolicitudAsc(Long idCalendario, EstadoSolicitud estado);

    // Solicitudes pendientes (para panel de aprobación)
    List<SolicitudCambioTurno> findByEstadoOrderByFechaSolicitudAsc(EstadoSolicitud estado);

    // Historial de solicitudes de un funcionario
    @Query("SELECT s FROM SolicitudCambioTurno s WHERE s.idFuncionarioSolicitante = :idFunc OR s.idFuncionarioReemplazo = :idFunc ORDER BY s.fechaSolicitud DESC")
    List<SolicitudCambioTurno> findHistorialByFuncionario(@Param("idFunc") Integer idFuncionario);

    // Solicitudes por calendario
    List<SolicitudCambioTurno> findByIdCalendarioOrderByFechaSolicitudDesc(Long idCalendario);

    // Verificar si existe solicitud pendiente para un slot
    boolean existsBySlotOriginalIdAndEstado(Long idSlot, EstadoSolicitud estado);
}
