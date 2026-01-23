package cl.sge.controller;

import cl.sge.entity.RequerimientoRegional;
import cl.sge.repository.RequerimientoRegionalRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requerimientos-regionales")
public class RequerimientoRegionalController {

    private final RequerimientoRegionalRepository repository;

    public RequerimientoRegionalController(RequerimientoRegionalRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/evento/{eventoId}")
    public List<RequerimientoRegional> getByEvento(@PathVariable Long eventoId) {
        return repository.findByEventoId(eventoId);
    }

    @PostMapping
    public RequerimientoRegional create(@RequestBody RequerimientoRegional req) {
        return repository.save(req);
    }
    
    @PostMapping("/batch")
    public List<RequerimientoRegional> createBatch(@RequestBody List<RequerimientoRegional> reqs) {
        return repository.saveAll(reqs);
    }
}
