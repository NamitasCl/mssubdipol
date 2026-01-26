package cl.sge.controller;

import cl.sge.entity.Recurso;
import cl.sge.repository.RecursoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {

    private final RecursoRepository repository;

    public RecursoController(RecursoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Recurso> getAll(@RequestParam(required = false) String unidad, @RequestParam(required = false) String registeredBy) {
        if (registeredBy != null && !registeredBy.isEmpty()) {
            return repository.findByRegisteredBy(registeredBy);
        }
        if (unidad != null && !unidad.isEmpty()) {
            return repository.findByUnidadDueña(unidad);
        }
        return repository.findAll();
    }

    @PostMapping
    public Recurso create(@RequestBody Recurso recurso) {
        return repository.save(recurso);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
