package cl.sge.controller;

import cl.sge.entity.TipoRecurso;
import cl.sge.repository.TipoRecursoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-recursos")
public class TipoRecursoController {

    private final TipoRecursoRepository repository;

    public TipoRecursoController(TipoRecursoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoRecurso> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoRecurso create(@RequestBody TipoRecurso tipo) {
        return repository.save(tipo);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
