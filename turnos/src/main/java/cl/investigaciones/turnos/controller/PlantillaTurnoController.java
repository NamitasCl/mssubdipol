package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.dto.PlantillaTurnoResponseDTO;
import cl.investigaciones.turnos.service.PlantillaTurnoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/plantillas")
public class PlantillaTurnoController {

    private final PlantillaTurnoService service;

    public PlantillaTurnoController(PlantillaTurnoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PlantillaTurnoResponseDTO> listar() {
        return service.listar();
    }

    @PostMapping
    public PlantillaTurnoResponseDTO crear(@RequestBody PlantillaTurnoRequestDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public PlantillaTurnoResponseDTO actualizar(@PathVariable Long id, @RequestBody PlantillaTurnoRequestDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}