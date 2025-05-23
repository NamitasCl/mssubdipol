package cl.investigaciones.commonservices.controller;

import cl.investigaciones.commonservices.dto.ConsultaUnidadDto;
import cl.investigaciones.commonservices.service.UnidadesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common/unidades")
@CrossOrigin("*")
public class ConsultaUnidadesController {

    @Autowired
    private UnidadesService unidadesService;

    @GetMapping
    public ResponseEntity<?> cronSaveUnidades() {
        try {
            unidadesService.cronSaveUnidad();
            return ResponseEntity.ok("Unidades guardadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al guardar unidades: " + e.getMessage());
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarUnidadesPorNombre(@RequestParam String nombre) {
        try {
            List<ConsultaUnidadDto> unidades = unidadesService.buscarUnidadesPorNombre(nombre);
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al buscar unidades: " + e.getMessage());
        }
    }
}