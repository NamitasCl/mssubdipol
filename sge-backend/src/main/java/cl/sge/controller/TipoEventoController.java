package cl.sge.controller;

import cl.sge.entity.TipoEvento;
import cl.sge.repository.TipoEventoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-eventos")
public class TipoEventoController {

    private final TipoEventoRepository repository;

    public TipoEventoController(TipoEventoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoEvento> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoEvento create(@RequestBody TipoEvento tipo) {
        return repository.save(tipo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
