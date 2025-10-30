package cl.investigaciones.turnosv2.controller;

// ... (imports)

import cl.investigaciones.turnosv2.dto.AsignacionDTO;
import cl.investigaciones.turnosv2.service.VisualizacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendarios")
@CrossOrigin("*")
public class VisualizacionController {

    @Autowired
    private VisualizacionService visualizacionService;

    // GET /api/calendarios/{id}/asignaciones
    // (Usado por VisualizacionCalendarioPage)
    @GetMapping("/{id}/asignaciones")
    public ResponseEntity<List<AsignacionDTO>> getAsignacionesResueltas(@PathVariable Long id) {
        // Un DTO es mejor aquí para enviar los datos "aplanados" (con slot y funcionario)
        // al frontend, tal como lo simulamos en la mockApi.
        return ResponseEntity.ok(visualizacionService.findAsignacionesByCalendario(id));
    }
}