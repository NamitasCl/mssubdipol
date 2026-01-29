package cl.sge.service;

import cl.sge.entity.AsignacionRecurso;
import cl.sge.entity.SolicitudRecurso;
import cl.sge.entity.SolicitudRecurso.EstadoSolicitud;
import cl.sge.repository.AsignacionRecursoRepository;
import cl.sge.repository.SolicitudRecursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudRecursoService {

    private final SolicitudRecursoRepository solicitudRepository;
    private final AsignacionRecursoRepository asignacionRepository;

    /**
     * Create a new resource request (PM-SUB only)
     */
    @Transactional
    public SolicitudRecurso crearSolicitud(SolicitudRecurso solicitud, String creadorRut) {
        solicitud.setCreadoPor(creadorRut);
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        return solicitudRepository.save(solicitud);
    }

    /**
     * Delegate a request to a sub-unit (PM-REG only)
     */
    @Transactional
    public SolicitudRecurso delegarSolicitud(Long solicitudId, String unidadDestino, String delegadorRut) {
        SolicitudRecurso solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden delegar solicitudes pendientes");
        }
        
        solicitud.setUnidadDestino(unidadDestino);
        solicitud.setDelegadoA(delegadorRut);
        solicitud.setEstado(EstadoSolicitud.DELEGADA);
        
        return solicitudRepository.save(solicitud);
    }

    /**
     * Add resources to a request (PM-REG or JEFE)
     */
    @Transactional
    public AsignacionRecurso asignarRecursos(AsignacionRecurso asignacion) {
        // Validate funcionarios are not already deployed
        LocalDateTime now = LocalDateTime.now();
        if (asignacion.getFuncionarios() != null) {
            for (var func : asignacion.getFuncionarios()) {
                if (asignacionRepository.isFuncionarioDesplegado(func.getRut(), now)) {
                    throw new RuntimeException("Funcionario " + func.getRut() + " ya está desplegado en otra emergencia");
                }
                // Mark as ASSIGNED
                func.setEstado("ASIGNADO");
            }
        }
        
        // Validate vehicles are not already deployed
        if (asignacion.getVehiculos() != null) {
            for (var vehiculo : asignacion.getVehiculos()) {
                if (asignacionRepository.isVehiculoDesplegado(vehiculo.getSigla(), now)) {
                    throw new RuntimeException("Vehículo " + vehiculo.getSigla() + " ya está desplegado");
                }
            }
        }
        
        asignacion.setFechaAsignacion(LocalDateTime.now());
        AsignacionRecurso saved = asignacionRepository.save(asignacion);
        
        // Update solicitud state
        actualizarEstadoSolicitud(asignacion.getSolicitud().getId());
        
        return saved;
    }

    /**
     * Update solicitud state based on fulfillment
     */
    @Transactional
    public void actualizarEstadoSolicitud(Long solicitudId) {
        SolicitudRecurso solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        Integer funcionariosAsignados = asignacionRepository.countFuncionariosBySolicitud(solicitudId);
        Integer vehiculosAsignados = asignacionRepository.countVehiculosBySolicitud(solicitudId);
        
        boolean funcionariosCumplidos = funcionariosAsignados >= solicitud.getFuncionariosRequeridos();
        boolean vehiculosCumplidos = vehiculosAsignados >= solicitud.getVehiculosRequeridos();
        
        if (funcionariosCumplidos && vehiculosCumplidos) {
            solicitud.setEstado(EstadoSolicitud.CUMPLIDA);
            solicitud.setFechaRespuesta(LocalDateTime.now());
        } else if (funcionariosAsignados > 0 || vehiculosAsignados > 0) {
            solicitud.setEstado(EstadoSolicitud.PARCIAL);
        }
        
        solicitudRepository.save(solicitud);
    }

    /**
     * Reject a request (PM-REG or JEFE)
     */
    @Transactional
    public SolicitudRecurso rechazarSolicitud(Long solicitudId, String motivo) {
        SolicitudRecurso solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setInstrucciones(solicitud.getInstrucciones() + "\n[RECHAZADA] " + motivo);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        
        return solicitudRepository.save(solicitud);
    }

    /**
     * Get solicitudes for a region (PM-REG view)
     */
    public List<SolicitudRecurso> getSolicitudesByRegion(String region) {
        List<SolicitudRecurso> solicitudes = solicitudRepository.findPendientesByRegion(region);
        solicitudes.forEach(this::enrichWithCounts);
        return solicitudes;
    }

    /**
     * Get solicitudes for a unit (JEFE view)
     */
    public List<SolicitudRecurso> getSolicitudesByUnidad(String unidad) {
        List<SolicitudRecurso> solicitudes = solicitudRepository.findPendientesByUnidad(unidad);
        solicitudes.forEach(this::enrichWithCounts);
        return solicitudes;
    }

    /**
     * Enrich solicitud with computed counts
     */
    private void enrichWithCounts(SolicitudRecurso solicitud) {
        Integer funcCount = asignacionRepository.countFuncionariosBySolicitud(solicitud.getId());
        Integer vehCount = asignacionRepository.countVehiculosBySolicitud(solicitud.getId());
        
        solicitud.setFuncionariosAsignados(funcCount);
        solicitud.setVehiculosAsignados(vehCount);
        
        int totalRequerido = solicitud.getFuncionariosRequeridos() + solicitud.getVehiculosRequeridos();
        int totalAsignado = funcCount + vehCount;
        double porcentaje = totalRequerido > 0 ? (double) totalAsignado / totalRequerido * 100 : 0;
        solicitud.setPorcentajeCumplimiento(porcentaje);
    }

    /**
     * Get officials assigned by a unit to a request (for vehicle crew allocation)
     */
    public List<cl.sge.entity.Funcionario> getFuncionariosAsignados(Long solicitudId, String unidadOrigen) {
        return asignacionRepository.findFuncionariosBySolicitudAndUnidad(solicitudId, unidadOrigen);
    }
}
