package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.DiasNoDisponiblesDTO;
import cl.investigaciones.turnos.service.DiasNoDisponiblesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos/funcionarios")
@CrossOrigin("*")
public class DiasNoDisponiblesController {

    private final DiasNoDisponiblesService diasService;

    public DiasNoDisponiblesController(DiasNoDisponiblesService diasService) {
        this.diasService = diasService;
    }

    @GetMapping("/dias-no-disponibles")
    public ResponseEntity<DiasNoDisponiblesDTO> obtenerDias(
            @RequestParam int mes,
            @RequestParam int anio
    ) {
        Map<Integer, List<String>> datos = diasService.getDiasNoDisponibles(mes, anio);
        return ResponseEntity.ok(new DiasNoDisponiblesDTO(datos));
    }
}