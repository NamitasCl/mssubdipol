package cl.sge.controller;

import cl.sge.entity.Funcionario;
import cl.sge.repository.FuncionarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/funcionarios")
@PreAuthorize("isAuthenticated()")
public class FuncionarioController {

    private final FuncionarioRepository repository;

    public FuncionarioController(FuncionarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Funcionario> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Funcionario create(@RequestBody Funcionario funcionario) {
        return repository.save(funcionario);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam(required = false) String unidad) {
        if (unidad != null) {
            return ResponseEntity.ok(repository.countByUnidad(unidad));
        }
        return ResponseEntity.ok(repository.count());
    }
}
