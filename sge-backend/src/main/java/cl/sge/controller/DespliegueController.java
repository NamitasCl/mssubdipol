package cl.sge.controller;

import cl.sge.entity.Despliegue;
import cl.sge.service.DespliegueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DespliegueController {

    @Autowired
    private DespliegueService despliegueService;

    @GetMapping("/eventos/{eventoId}/despliegues")
    public ResponseEntity<List<Despliegue>> getDesplieguesByEvento(@PathVariable Long eventoId) {
        return ResponseEntity.ok(despliegueService.findAllByEventoId(eventoId));
    }

    @GetMapping("/despliegues")
    public ResponseEntity<List<Despliegue>> getAllDespliegues() {
        return ResponseEntity.ok(despliegueService.findAll());
    }

    @GetMapping("/despliegues/{id}")
    public ResponseEntity<Despliegue> getDespliegueById(@PathVariable Long id) {
        Despliegue d = despliegueService.findById(id);
        if (d == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(d);
    }

    @PostMapping("/eventos/{eventoId}/despliegues")
    public ResponseEntity<Despliegue> createDespliegue(@PathVariable Long eventoId, @RequestBody Despliegue despliegue) {
        return ResponseEntity.ok(despliegueService.createDespliegue(eventoId, despliegue));
    }

    @PutMapping("/despliegues/{id}/prorroga")
    public ResponseEntity<Despliegue> prorrogarDespliegue(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Boolean mismoPeriodo = (Boolean) payload.get("mismoPeriodo");
        
        if (Boolean.TRUE.equals(mismoPeriodo)) {
            return ResponseEntity.ok(despliegueService.prorrogarDespliegueMismoPeriodo(id));
        } else {
            String fechaStr = (String) payload.get("nuevaFechaTermino");
            if (fechaStr == null) {
                return ResponseEntity.badRequest().build();
            }
            // Ensure frontend sends ISO format: "2023-10-25T12:00:00"
            LocalDateTime nuevaFecha = LocalDateTime.parse(fechaStr);
            return ResponseEntity.ok(despliegueService.prorrogarDespliegue(id, nuevaFecha));
        }
    }

    @DeleteMapping("/despliegues/{id}")
    public ResponseEntity<Void> deleteDespliegue(@PathVariable Long id) {
        despliegueService.deleteDespliegue(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/despliegues/{id}/recambio")
    public ResponseEntity<Despliegue> realizarRecambio(@PathVariable Long id) {
        return ResponseEntity.ok(despliegueService.realizarRecambio(id));
    }
}
