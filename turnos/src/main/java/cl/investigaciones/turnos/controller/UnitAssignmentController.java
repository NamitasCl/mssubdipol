package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.UnitAssignmentDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/turnos/unitassignment")
@CrossOrigin("*")
public class UnitAssignmentController {

    @PutMapping
    public ResponseEntity<?> updateUnitAssignment(@RequestBody UnitAssignmentDTO unitData) {
        System.out.println("Guardando asignación: " + unitData);
        // Aquí se haría la lógica para asociar la lista 'assigned' con la unidad en base de datos
        return ResponseEntity.ok().build();
    }
}