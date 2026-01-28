package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.dto.relatojenadep.RelatoJenadepRequest;
import cl.investigaciones.nodos.service.relatojenadep.RelatoJenadepService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/nodos/relatojenadep")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class RelatoJenadepController {

    private final RelatoJenadepService relatoJenadepService;

    public RelatoJenadepController(RelatoJenadepService relatoJenadepService) {
        this.relatoJenadepService = relatoJenadepService;
    }

    @PostMapping("/guardar")
    public ResponseEntity<?> guardarRelatoJenadep(@RequestBody RelatoJenadepRequest request) {
        try {
            return ResponseEntity.ok(relatoJenadepService.save(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
