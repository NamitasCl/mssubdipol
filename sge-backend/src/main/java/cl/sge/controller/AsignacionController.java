package cl.sge.controller;

import cl.sge.entity.Asignacion;
import cl.sge.repository.AsignacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones")
public class AsignacionController {

    private final AsignacionRepository repository;

    public AsignacionController(AsignacionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Asignacion> getAll() {
        return repository.findAll();
    }
    
    @GetMapping("/despliegue/{despliegueId}")
    public List<Asignacion> getByDespliegue(@PathVariable Long despliegueId) {
        return repository.findByDespliegueId(despliegueId);
    }

    @PostMapping
    public Asignacion create(@RequestBody Asignacion asignacion) {
        // TODO: Validate availability of resources
        return repository.save(asignacion);
    }
}
