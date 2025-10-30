package cl.investigaciones.turnosv2.controller;

import cl.investigaciones.turnosv2.domain.PlantillaRequerimiento;
import cl.investigaciones.turnosv2.service.PlantillaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnosv2/plantillas") // Coincide con la ruta del frontend
@CrossOrigin("*")
public class PlantillaController {

    private final PlantillaService plantillaService; // El Service hará el trabajo

    public PlantillaController(PlantilaService plantilaService) {
        this.plantillaService = plantilaService;
    }

    // GET /api/plantillas
    // (Usado por PlantillasPage para listar todas)
    @GetMapping
    public ResponseEntity<List<PlantillaRequerimiento>> getAllPlantillas() {
        List<PlantillaRequerimiento> plantillas = plantillaService.findAll();
        return ResponseEntity.ok(plantillas);
    }

    // POST /api/plantillas
    // (Usado por PlantillaForm para crear una nueva)
    @PostMapping
    public ResponseEntity<PlantillaRequerimiento> createPlantilla(@RequestBody PlantillaRequerimiento plantilla) {
        PlantillaRequerimiento nuevaPlantilla = plantillaService.save(plantilla);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaPlantilla);
    }

    // PUT /api/plantillas/{id}
    // (Usado por PlantillaForm para editar)
    @PutMapping("/{id}")
    public ResponseEntity<PlantillaRequerimiento> updatePlantilla(@PathVariable Long id, @RequestBody PlantillaRequerimiento plantilla) {
        // El Service se encargará de verificar si el id existe
        PlantillaRequerimiento plantillaActualizada = plantillaService.update(id, plantilla);
        return ResponseEntity.ok(plantillaActualizada);
    }

    // DELETE /api/plantillas/{id}
    // (Usado por PlantillaList para borrar)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantilla(@PathVariable Long id) {
        plantillaService.delete(id);
        return ResponseEntity.noContent().build(); // HTTP 204
    }
}