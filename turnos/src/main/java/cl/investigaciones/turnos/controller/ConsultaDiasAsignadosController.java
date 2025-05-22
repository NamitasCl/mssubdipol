package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.DiaAsignadoFuncionarioRequest;
import cl.investigaciones.turnos.service.ConsultaDiasAsignadosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/turnos/consulta-dia-asignado")
public class ConsultaDiasAsignadosController {

    private final ConsultaDiasAsignadosService consultaDiasAsignadosService;

    public ConsultaDiasAsignadosController(ConsultaDiasAsignadosService consultaDiasAsignadosService) {
        this.consultaDiasAsignadosService = consultaDiasAsignadosService;
    }

    @PostMapping
    public ResponseEntity<?> consultaDiaAsignadoFuncionario(@RequestBody DiaAsignadoFuncionarioRequest request) {
        try {
            System.out.println("Id: " + request.getIdFuncionario());
            System.out.println("Fecha: " + request.getFecha());
            return ResponseEntity.ok(consultaDiasAsignadosService.consultaDiaAsignadoFuncionario(request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar los días asignados: " + e.getMessage());
        }
    }
}