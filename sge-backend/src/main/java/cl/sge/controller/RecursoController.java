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
    public List<Recurso> getAll() {
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
