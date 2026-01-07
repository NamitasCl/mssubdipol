package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.domain.CalendarState;
import cl.investigaciones.turnos.calendar.dto.*;
import cl.investigaciones.turnos.calendar.service.CalendarioService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos/calendario")
@CrossOrigin("*")
public class CalendarioController {
    private final CalendarioService servicio;

    public CalendarioController(CalendarioService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public CalendarioResponseDTO crear(@RequestBody CalendarioRequestDTO req, @RequestHeader("usuario") int usuario) throws JsonProcessingException {
        return servicio.crearCalendario(req, usuario);
    }

    @GetMapping
    public List<CalendarioResponseDTO> listar() {
        return servicio.listarCalendarios();
    }

    @GetMapping("/{id}")
    public CalendarioResponseDTO buscar(@PathVariable Long id) {
        return servicio.buscarPorId(id).orElseThrow(() -> new RuntimeException("Calendario no encontrado"));
    }

    @GetMapping("/unidad/{unidadId}")
    public List<CalendarioResponseDTO> listarPorUnidad(@PathVariable Long unidadId) {
        return servicio.listarPorUnidad(unidadId);
    }

    @GetMapping("/estado/{estado}")
    public List<CalendarioResponseDTO> listarPorEstado(@PathVariable CalendarState estado) {
        return servicio.listarPorEstado(estado);
    }

    @PutMapping("/{id}")
    public CalendarioResponseDTO actualizar(@PathVariable Long id, @RequestBody CalendarioRequestDTO req, @RequestHeader("usuario") int usuario) {
        return servicio.actualizar(id, req, usuario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado o eliminado"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id, @RequestHeader("usuario") int usuario) {
        if (!servicio.eliminar(id, usuario)) {
            throw new RuntimeException("Calendario no encontrado o ya eliminado");
        }
    }

    @PutMapping("/{id}/estado")
    public CalendarioResponseDTO cambiarEstado(@PathVariable Long id, @RequestParam CalendarState estado, @RequestHeader("usuario") int usuario) {
        return servicio.cambiarEstado(id, estado, usuario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado o eliminado"));
    }

    @PostMapping("/{id}/revision/aprobar")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('JEFE_UNIDAD', 'SUBJEFE_UNIDAD')")
    public CalendarioResponseDTO aprobar(@PathVariable Long id) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return servicio.aprobar(id, username)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado o eliminado"));
    }

    @PostMapping("/{id}/revision/observar")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('JEFE_UNIDAD', 'SUBJEFE_UNIDAD')")
    public CalendarioResponseDTO observar(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        String observacion = body.get("observacion");
        return servicio.observar(id, username, observacion)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado o eliminado"));
    }
}