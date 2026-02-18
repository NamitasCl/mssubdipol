package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.SolicitudCambioRequestDTO;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioResponseDTO;
import cl.investigaciones.turnos.calendar.service.SolicitudCambioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos/solicitudes-cambio")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class SolicitudCambioController {

    private final SolicitudCambioService solicitudService;

    /**
     * Crea una nueva solicitud de cambio de turno.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SolicitudCambioResponseDTO> crearSolicitud(
            @RequestBody SolicitudCambioRequestDTO dto,
            @RequestHeader("idFuncionario") Integer idFuncionario,
            @RequestHeader(value = "nombreFuncionario", required = false, defaultValue = "Funcionario") String nombreFuncionario
    ) {
        log.info("POST /solicitudes-cambio - Funcionario: {}", idFuncionario);
        SolicitudCambioResponseDTO result = solicitudService.crearSolicitud(dto, idFuncionario, nombreFuncionario);
        return ResponseEntity.ok(result);
    }

    /**
     * Obtiene solicitudes pendientes de aprobación.
     */
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('SUBJEFE', 'JEFE', 'ADMINISTRADOR')")
    public ResponseEntity<List<SolicitudCambioResponseDTO>> obtenerPendientes() {
        log.info("GET /solicitudes-cambio/pendientes");
        return ResponseEntity.ok(solicitudService.obtenerPendientes());
    }

    /**
     * Obtiene historial de solicitudes de un funcionario.
     */
    @GetMapping("/historial/{idFuncionario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SolicitudCambioResponseDTO>> obtenerHistorial(
            @PathVariable Integer idFuncionario
    ) {
        log.info("GET /solicitudes-cambio/historial/{}", idFuncionario);
        return ResponseEntity.ok(solicitudService.obtenerHistorialFuncionario(idFuncionario));
    }

    /**
     * Aprueba una solicitud de cambio.
     */
    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasAnyRole('SUBJEFE', 'JEFE', 'ADMINISTRADOR')")
    public ResponseEntity<SolicitudCambioResponseDTO> aprobar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader("idFuncionario") Integer idAprobador,
            @RequestHeader(value = "nombreFuncionario", required = false, defaultValue = "Aprobador") String nombreAprobador
    ) {
        log.info("PUT /solicitudes-cambio/{}/aprobar - Aprobador: {}", id, nombreAprobador);
        String observacion = body != null ? body.get("observacion") : null;
        return ResponseEntity.ok(solicitudService.aprobarSolicitud(id, idAprobador, nombreAprobador, observacion));
    }

    /**
     * Rechaza una solicitud de cambio.
     */
    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('SUBJEFE', 'JEFE', 'ADMINISTRADOR')")
    public ResponseEntity<SolicitudCambioResponseDTO> rechazar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("idFuncionario") Integer idAprobador,
            @RequestHeader(value = "nombreFuncionario", required = false, defaultValue = "Aprobador") String nombreAprobador
    ) {
        log.info("PUT /solicitudes-cambio/{}/rechazar - Aprobador: {}", id, nombreAprobador);
        String observacion = body.get("observacion");
        return ResponseEntity.ok(solicitudService.rechazarSolicitud(id, idAprobador, nombreAprobador, observacion));
    }
}
