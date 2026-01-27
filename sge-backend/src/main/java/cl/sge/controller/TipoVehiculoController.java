package cl.sge.controller;

import cl.sge.entity.TipoVehiculo;
import cl.sge.repository.TipoVehiculoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-vehiculos")
@CrossOrigin(origins = "*") // Allow frontend access
public class TipoVehiculoController {

    private final TipoVehiculoRepository repository;

    public TipoVehiculoController(TipoVehiculoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TipoVehiculo> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TipoVehiculo create(@RequestBody TipoVehiculo tipo) {
        return repository.save(tipo);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
