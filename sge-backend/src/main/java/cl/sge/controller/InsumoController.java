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
    public List<Insumo> getAll(@RequestParam(required = false) String unidad, @RequestParam(required = false) String registeredBy) {
        if (registeredBy != null && !registeredBy.isEmpty()) {
            return repository.findByRegisteredBy(registeredBy);
        }
        if (unidad != null && !unidad.isEmpty()) {
            return repository.findByUnidadDueña(unidad);
        }
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
