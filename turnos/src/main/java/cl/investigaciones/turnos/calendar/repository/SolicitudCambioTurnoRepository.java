package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.EstadoSolicitud;
import cl.investigaciones.turnos.calendar.domain.SolicitudCambioTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudCambioTurnoRepository extends JpaRepository<SolicitudCambioTurno, Long> {
    
    List<SolicitudCambioTurno> findBySiglasUnidadOrigenAndEstado(
        String siglasUnidad, 
        EstadoSolicitud estado
    );
    
    List<SolicitudCambioTurno> findByIdFuncionarioSolicitanteAndEstado(
        Integer idFuncionario, 
        EstadoSolicitud estado
    );
    
    List<SolicitudCambioTurno> findByIdFuncionarioSolicitanteOrderByFechaSolicitudDesc(
        Integer idFuncionario
    );
    
    @Query("SELECT s FROM SolicitudCambioTurno s WHERE " +
           "(s.idSlotOrigen = :idSlot OR s.idSlotDestino = :idSlot) " +
           "AND s.estado = 'PENDIENTE'")
    List<SolicitudCambioTurno> findPendientesBySlot(@Param("idSlot") Long idSlot);
}
