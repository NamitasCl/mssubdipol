package cl.investigaciones.turnos.plantilla.controller;

import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoResponseDTO;
import cl.investigaciones.turnos.plantilla.service.PlantillaTurnoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/turnos/plantillas")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class PlantillaTurnoController {
    private final PlantillaTurnoService service;

    public PlantillaTurnoController(PlantillaTurnoService service) {
        this.service = service;
    }

    @PostMapping
    public PlantillaTurnoResponseDTO crear(@RequestBody PlantillaTurnoRequestDTO req) {
        return service.crear(req);
    }

    @GetMapping
    public List<PlantillaTurnoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public PlantillaTurnoResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));
    }

    @PutMapping("/{id}")
    public PlantillaTurnoResponseDTO actualizar(@PathVariable Long id, @RequestBody PlantillaTurnoRequestDTO req) {
        return service.actualizar(id, req)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        if (!service.eliminar(id)) {
            throw new RuntimeException("Plantilla no encontrada o ya eliminada");
        }
    }

    @PutMapping("/{id}/desactivar")
    public void desactivar(@PathVariable Long id) {
        if (!service.desactivar(id)) {
            throw new RuntimeException("Plantilla no encontrada o ya desactivada");
        }
    }
}

