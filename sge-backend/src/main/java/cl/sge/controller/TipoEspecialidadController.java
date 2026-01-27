package cl.sge.controller;

import cl.sge.entity.TipoEspecialidad;
import cl.sge.repository.TipoEspecialidadRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-especialidades")
public class TipoEspecialidadController {

    private final TipoEspecialidadRepository repository;

    public TipoEspecialidadController(TipoEspecialidadRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoEspecialidad> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoEspecialidad create(@RequestBody TipoEspecialidad tipo) {
        return repository.save(tipo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
