package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.*;
import cl.investigaciones.turnos.service.AsignacionFuncionarioTurnoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/asignaciones")
@CrossOrigin("*")
public class AsignacionFuncionarioTurnoController {

    private final AsignacionFuncionarioTurnoService service;

    public AsignacionFuncionarioTurnoController(AsignacionFuncionarioTurnoService service) {
        this.service = service;
    }

    @GetMapping("/mes")
    public ResponseEntity<List<DiaConAsignacionesDTO>> obtenerAsignacionesMes(@RequestParam int mes, @RequestParam int anio) {
        return ResponseEntity.ok(service.obtenerAsignaciones(mes, anio));
    }

    @GetMapping("/mes/{unidad}")
    public ResponseEntity<List<DiaConAsignacionesDTO>> obtenerAsignacionesMesPorUnidad(
            @PathVariable("unidad") String unidad,
            @RequestParam int mes,
            @RequestParam int anio
    ) {
        return ResponseEntity.ok(service.obtenerAsignacionesPorMesAnioUnidad(mes, anio, unidad));
    }

    @PostMapping("/dia")
    public ResponseEntity<?> guardarAsignaciones(@RequestBody AsignacionTurnoRequestDTO dto) {
        service.guardarAsignaciones(dto);
        return ResponseEntity.ok("Asignaciones guardadas correctamente");
    }

    @PutMapping("/actualizar-turno-unidad")
    public ResponseEntity<?> actualizarTurnoUnidad(@RequestBody ActualizacionTurnoUnidadWrapper dto) {
        System.out.println("Actualizando turnos por unidad...");
        service.actualizarTurnoPorUnidad(dto);
        System.out.println("Turnos actualizados correctamente");
        return ResponseEntity.ok().build();
    }
}