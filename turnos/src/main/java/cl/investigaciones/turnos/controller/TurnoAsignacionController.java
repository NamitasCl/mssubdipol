package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.TurnoAsignacionDTO;
import cl.investigaciones.turnos.mapper.TurnoAsignacionMapper;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.service.TurnoAsignacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin("*")
public class TurnoAsignacionController {

    private final TurnoAsignacionService turnoAsignacionService;

    public TurnoAsignacionController(TurnoAsignacionService turnoAsignacionService) {
        this.turnoAsignacionService = turnoAsignacionService;
    }

    @GetMapping
    public ResponseEntity<TurnoAsignacionDTO> obtenerTurnosPorMesYAno(
            @RequestParam int mes,
            @RequestParam int anio
    ) {
        TurnoAsignacion turno = turnoAsignacionService.findByMesAndAnio(mes, anio)
                .orElseThrow(() -> new RuntimeException("No existen turnos para ese mes/año"));

        TurnoAsignacionDTO dto = TurnoAsignacionMapper.mapToResponseDTO(turno);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getTurnoStatus(
            @RequestParam int mes,
            @RequestParam int anio
    ) {
        Optional<TurnoAsignacion> opt = turnoAsignacionService.getByMesAnio(mes, anio);
        boolean isActive = opt.isPresent() && opt.get().isActivo();
        return ResponseEntity.ok(Map.of("activo", isActive));
    }

    @GetMapping("/mesesactivos2")
    public ResponseEntity<?> getResumenUnidades() {
        return ResponseEntity.ok(turnoAsignacionService.getResumenAgrupadoPorMes());
    }

    @PostMapping
    public ResponseEntity<TurnoAsignacionDTO> guardarTurnos(@RequestBody TurnoAsignacionDTO turnoAsignacionDTO) {
        TurnoAsignacion saved = turnoAsignacionService.saveTurnoAsignacion(turnoAsignacionDTO);
        TurnoAsignacionDTO response = TurnoAsignacionMapper.mapToResponseDTO(saved);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/open-close")
    public ResponseEntity<?> openOrCloseMonth(
            @RequestParam int mes,
            @RequestParam int anio,
            @RequestParam boolean open,
            @RequestParam int turnos
    ) {
        try {
            turnoAsignacionService.openOrCloseMonth(mes, anio, open, turnos);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}