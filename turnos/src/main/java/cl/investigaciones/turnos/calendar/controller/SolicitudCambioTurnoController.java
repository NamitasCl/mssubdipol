package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.SolicitudCambioTurnoRequestDTO;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioTurnoResponseDTO;
import cl.investigaciones.turnos.calendar.service.SolicitudCambioTurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos/solicitudes-cambio")
@CrossOrigin("*")
public class SolicitudCambioTurnoController {

    @Autowired
    private SolicitudCambioTurnoService service;

    // ========================================
    // Endpoints para FUNCIONARIOS
    // ========================================

    @PostMapping
    public ResponseEntity<SolicitudCambioTurnoResponseDTO> crear(
            @RequestBody SolicitudCambioTurnoRequestDTO dto,
            @RequestAttribute("idFuncionario") Integer idFuncionario,
            @RequestAttribute("siglasUnidad") String siglasUnidad
    ) {
        SolicitudCambioTurnoResponseDTO response = service.crearSolicitud(dto, idFuncionario, siglasUnidad);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<SolicitudCambioTurnoResponseDTO>> misSolicitudes(
            @RequestAttribute("idFuncionario") Integer idFuncionario
    ) {
        List<SolicitudCambioTurnoResponseDTO> solicitudes = service.listarMisSolicitudes(idFuncionario);
        return ResponseEntity.ok(solicitudes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @RequestAttribute("idFuncionario") Integer idFuncionario
    ) {
        service.cancelarSolicitud(id, idFuncionario);
        return ResponseEntity.ok().build();
    }

    // ========================================
    // Endpoints para JEFES/SUBJEFES
    // ========================================

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('JEFE', 'SUBJEFE', 'ADMINISTRADOR')")
    public ResponseEntity<List<SolicitudCambioTurnoResponseDTO>> pendientes(
            @RequestAttribute("siglasUnidad") String siglasUnidad
    ) {
        List<SolicitudCambioTurnoResponseDTO> solicitudes = 
            service.listarSolicitudesPendientesPorUnidad(siglasUnidad);
        return ResponseEntity.ok(solicitudes);
    }

    @PostMapping("/{id}/aprobar")
    @PreAuthorize("hasAnyRole('JEFE', 'SUBJEFE', 'ADMINISTRADOR')")
    public ResponseEntity<SolicitudCambioTurnoResponseDTO> aprobar(
            @PathVariable Long id,
            @RequestAttribute("idFuncionario") Integer idAprobador,
            @RequestAttribute("siglasUnidad") String siglasUnidad
    ) {
        SolicitudCambioTurnoResponseDTO response = 
            service.aprobarSolicitud(id, idAprobador, siglasUnidad);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('JEFE', 'SUBJEFE', 'ADMINISTRADOR')")
    public ResponseEntity<SolicitudCambioTurnoResponseDTO> rechazar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestAttribute("idFuncionario") Integer idAprobador,
            @RequestAttribute("siglasUnidad") String siglasUnidad
    ) {
        String motivo = body.get("motivo");
        SolicitudCambioTurnoResponseDTO response = 
            service.rechazarSolicitud(id, idAprobador, siglasUnidad, motivo);
        return ResponseEntity.ok(response);
    }
}
