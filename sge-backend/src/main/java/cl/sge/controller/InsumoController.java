package cl.sge.controller;

import cl.sge.entity.Insumo;
import cl.sge.repository.InsumoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    private final InsumoRepository repository;

    public InsumoController(InsumoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Insumo> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Insumo create(@RequestBody Insumo insumo) {
        return repository.save(insumo);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
