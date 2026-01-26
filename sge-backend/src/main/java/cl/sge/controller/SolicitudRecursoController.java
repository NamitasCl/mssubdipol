package cl.sge.controller;

import cl.sge.entity.AsignacionRecurso;
import cl.sge.entity.SolicitudRecurso;
import cl.sge.repository.SolicitudRecursoRepository;
import cl.sge.service.SolicitudRecursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudRecursoController {

    private final SolicitudRecursoService solicitudService;
    private final SolicitudRecursoRepository solicitudRepository;

    /**
     * Create a new resource request - PM_SUB only
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PM_SUB', 'JEFE', 'ADMINISTRADOR', 'DIRECTOR')")
    public ResponseEntity<SolicitudRecurso> crearSolicitud(
            @RequestBody SolicitudRecurso solicitud,
            java.security.Principal principal) {
        SolicitudRecurso created = solicitudService.crearSolicitud(solicitud, principal.getName());
        return ResponseEntity.ok(created);
    }

    /**
     * Get all solicitudes for a deployment - For consolidated view
     */
    @GetMapping("/despliegue/{despliegueId}")
    @PreAuthorize("hasAnyRole('PM_SUB', 'DIRECTOR')")
    public ResponseEntity<List<SolicitudRecurso>> getByDespliegue(@PathVariable Long despliegueId) {
        return ResponseEntity.ok(solicitudRepository.findByDespliegueId(despliegueId));
    }

    /**
     * Get solicitudes assigned to my region - PM_REG view
     */
    @GetMapping("/mi-region")
    @PreAuthorize("hasRole('PM_REG')")
    public ResponseEntity<List<SolicitudRecurso>> getMisSolicitudesRegion(
            @RequestParam String region) {
        return ResponseEntity.ok(solicitudService.getSolicitudesByRegion(region));
    }

    /**
     * Get solicitudes assigned to my unit - JEFE view
     */
    @GetMapping("/mi-unidad")
    @PreAuthorize("hasRole('JEFE')")
    public ResponseEntity<List<SolicitudRecurso>> getMisSolicitudesUnidad(
            @RequestParam String unidad) {
        return ResponseEntity.ok(solicitudService.getSolicitudesByUnidad(unidad));
    }

    /**
     * Delegate a solicitud to a sub-unit - PM_REG only
     */
    @PostMapping("/{id}/delegar")
    @PreAuthorize("hasRole('PM_REG')")
    public ResponseEntity<SolicitudRecurso> delegarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            java.security.Principal principal) {
        String unidadDestino = body.get("unidadDestino");
        SolicitudRecurso delegada = solicitudService.delegarSolicitud(id, unidadDestino, principal.getName());
        return ResponseEntity.ok(delegada);
    }

    /**
     * Assign resources to a solicitud - PM_REG or JEFE
     */
    @PostMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('PM_REG', 'JEFE')")
    public ResponseEntity<AsignacionRecurso> asignarRecursos(
            @PathVariable Long id,
            @RequestBody AsignacionRecurso asignacion,
            java.security.Principal principal) {
        // Ensure solicitud is set from path
        SolicitudRecurso solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        asignacion.setSolicitud(solicitud);
        asignacion.setAsignadoPor(principal.getName());
        
        AsignacionRecurso created = solicitudService.asignarRecursos(asignacion);
        return ResponseEntity.ok(created);
    }

    /**
     * Reject a solicitud - PM_REG or JEFE
     */
    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('PM_REG', 'JEFE')")
    public ResponseEntity<SolicitudRecurso> rechazarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        SolicitudRecurso rechazada = solicitudService.rechazarSolicitud(id, motivo);
        return ResponseEntity.ok(rechazada);
    }

    /**
     * Get fulfillment status of a solicitud
     */
    @GetMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> getEstado(@PathVariable Long id) {
        SolicitudRecurso solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        return ResponseEntity.ok(Map.of(
            "id", solicitud.getId(),
            "estado", solicitud.getEstado(),
            "funcionariosRequeridos", solicitud.getFuncionariosRequeridos(),
            "vehiculosRequeridos", solicitud.getVehiculosRequeridos()
        ));
    }
}
