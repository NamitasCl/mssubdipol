package cl.sge.controller;

import cl.sge.entity.Vehiculo;
import cl.sge.repository.VehiculoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoRepository repository;

    public VehiculoController(VehiculoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Vehiculo> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Vehiculo create(@RequestBody Vehiculo vehiculo) {
        return repository.save(vehiculo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
