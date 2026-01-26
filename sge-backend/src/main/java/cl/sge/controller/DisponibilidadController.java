package cl.sge.controller;

import cl.sge.entity.DisponibilidadRecursos;
import cl.sge.repository.DisponibilidadRecursosRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disponibilidad")
@CrossOrigin(origins = "*")
public class DisponibilidadController {

    private final DisponibilidadRecursosRepository repository;

    public DisponibilidadController(DisponibilidadRecursosRepository repository) {
        this.repository = repository;
    }

    // Get all availability reports
    @GetMapping
    public List<DisponibilidadRecursos> getAll() {
        return repository.findAll();
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<DisponibilidadRecursos> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get by region or jefatura
    @GetMapping("/region/{regionOJefatura}")
    public List<DisponibilidadRecursos> getByRegion(@PathVariable String regionOJefatura) {
        return repository.findByRegionOJefatura(regionOJefatura);
    }

    // Get only disponible resources
    @GetMapping("/disponibles")
    public List<DisponibilidadRecursos> getDisponibles() {
        return repository.findByEstado(DisponibilidadRecursos.EstadoDisponibilidad.DISPONIBLE);
    }

    // Get disponible by region
    @GetMapping("/region/{regionOJefatura}/disponibles")
    public List<DisponibilidadRecursos> getDisponiblesByRegion(@PathVariable String regionOJefatura) {
        return repository.findByRegionOJefaturaAndEstado(
            regionOJefatura, 
            DisponibilidadRecursos.EstadoDisponibilidad.DISPONIBLE
        );
    }

    // Create new availability report (NO AUTH REQUIRED - Anyone can report)
    @PostMapping
    public DisponibilidadRecursos create(@RequestBody DisponibilidadRecursos disponibilidad) {
        return repository.save(disponibilidad);
    }

    // Update existing report
    @PutMapping("/{id}")
    public ResponseEntity<DisponibilidadRecursos> update(
            @PathVariable Long id,
            @RequestBody DisponibilidadRecursos updated) {
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    return ResponseEntity.ok(repository.save(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete report
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
