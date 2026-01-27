package cl.sge.controller;

import cl.sge.entity.ModuleConfig;
import cl.sge.repository.ModuleConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*")
public class ModuleConfigController {

    private final ModuleConfigRepository repository;

    public ModuleConfigController(ModuleConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ModuleConfig> getAll() {
        return repository.findAll();
    }

    @GetMapping("/active")
    public List<ModuleConfig> getActive() {
        return repository.findByEnabledTrue();
    }

    @PutMapping("/{key}")
    public ResponseEntity<ModuleConfig> update(@PathVariable String key, @RequestBody ModuleConfig config) {
        return repository.findById(key)
                .map(existing -> {
                    existing.setTitle(config.getTitle());
                    existing.setDescription(config.getDescription());
                    existing.setEnabled(config.isEnabled());
                    existing.setAuthorizedRoles(config.getAuthorizedRoles());
                    // Route, Icon, Color could also be editable, but usually fixed for code links
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
