package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.UnidadColaboradoraDTO;
import cl.investigaciones.turnos.dto.UnidadColaboradoraRequestDTO;
import cl.investigaciones.turnos.dto.UnidadColaboradoraResponseDTO;
import cl.investigaciones.turnos.model.UnidadColaboradora;
import cl.investigaciones.turnos.service.UnidadColaboradoraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/unidades-colaboradoras")
@CrossOrigin("*")
public class UnidadColaboradoraController {

    private final UnidadColaboradoraService service;

    public UnidadColaboradoraController(UnidadColaboradoraService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getUnidadesColaboradorasPorTurnoAsignacion(
            @RequestParam Long turnoAsignacion
    ) {
        try {
            List<UnidadColaboradora> unidades = service
                    .findByTurnoAsignacion(turnoAsignacion);

            List<UnidadColaboradoraResponseDTO> response = unidades.stream()
                    .map(unidad -> {
                        UnidadColaboradoraResponseDTO dto = new UnidadColaboradoraResponseDTO();
                        dto.setId(unidad.getId());
                        dto.setSiglasUnidad(unidad.getSiglasUnidad());
                        dto.setCantFuncAporte(unidad.getCantFuncAporte());
                        dto.setMaxTurnos(unidad.getMaxTurnos());
                        dto.setTrabajadoresPorDia(unidad.getTrabajadoresPorDia());
                        dto.setTrabajaFindesemana(unidad.isTrabajaFindesemana());
                        return dto;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar unidades: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody UnidadColaboradoraRequestDTO request) {
        try {
            return ResponseEntity.ok(service.save(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/lote")
    public ResponseEntity<?> guardarUnidades(@RequestBody List<UnidadColaboradoraDTO> unidades) {
        try {
            System.out.println(unidades);
            for (UnidadColaboradoraDTO dto : unidades) {
                service.saveOrUpdate(dto);
            }
            return ResponseEntity.ok().body("Unidades guardadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
