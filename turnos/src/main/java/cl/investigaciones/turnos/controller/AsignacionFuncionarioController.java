package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.*;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.repository.TurnoAsignacionRepository;
import cl.investigaciones.turnos.service.AsignacionFuncionarioService;
import cl.investigaciones.turnos.service.FuncionarioDiasNoDisponibleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/asignaciones")
@CrossOrigin("*")
public class AsignacionFuncionarioController {

    private final AsignacionFuncionarioService asignacionFuncionarioService;
    private final TurnoAsignacionRepository turnoAsignacionRepository;

    public AsignacionFuncionarioController(AsignacionFuncionarioService asigService, TurnoAsignacionRepository turnoRepo) {
        this.asignacionFuncionarioService = asigService;
        this.turnoAsignacionRepository = turnoRepo;
    }

    // POST /api/turnos/asignaciones/{turnoAsignacionId}/{unidad}
    @PostMapping("/{turnoAsignacionId}/{unidad}")
    public ResponseEntity<?> guardarAsignaciones(
            @PathVariable Long turnoAsignacionId,
            @PathVariable String unidad,
            @RequestBody List<FuncionarioAsignadoDTO> funcionarios) {

        TurnoAsignacion calendario = turnoAsignacionRepository.findById(turnoAsignacionId)
                .orElseThrow(() -> new RuntimeException("No existe el calendario"));

        for (FuncionarioAsignadoDTO dto : funcionarios) {
            AsignacionFuncionario entidad = new AsignacionFuncionario();
            entidad.setIdFuncionario(dto.getIdFuncionario());
            entidad.setNombreCompleto(dto.getNombreCompleto());
            entidad.setSiglasCargo(dto.getSiglasCargo());
            entidad.setAntiguedad(dto.getAntiguedad());
            entidad.setUnidad(unidad);
            entidad.setTurnoAsignacion(calendario);

            if (dto.getDiasNoDisponibles() != null) {
                List<FuncionarioDiasNoDisponible> listaDias = dto.getDiasNoDisponibles().stream().map(diasDto -> {
                    FuncionarioDiasNoDisponible d = new FuncionarioDiasNoDisponible();
                    d.setFecha(diasDto.getFecha());
                    d.setFechaInicio(diasDto.getFechaInicio());
                    d.setFechaFin(diasDto.getFechaFin());
                    d.setMotivo(diasDto.getMotivo());
                    d.setDetalle(diasDto.getDetalle());
                    d.setAsignacionFuncionario(entidad);
                    return d;
                }).toList();
                entidad.setDiasNoDisponibles(listaDias);
            }

            asignacionFuncionarioService.saveOrUpdate(entidad, turnoAsignacionId, unidad);
        }
        return ResponseEntity.ok("Asignaciones guardadas/actualizadas correctamente");
    }

    // GET /api/turnos/asignaciones/{turnoAsignacionId}/{unidad}
    @GetMapping("/{turnoAsignacionId}/{unidad}")
    public ResponseEntity<List<FuncionarioAsignadoDTO>> getAsignaciones(
            @PathVariable Long turnoAsignacionId,
            @PathVariable String unidad) {

        List<AsignacionFuncionario> asignaciones = asignacionFuncionarioService
                .getAsignacionesPorCalendarioYUnidad(turnoAsignacionId, unidad);

        List<FuncionarioAsignadoDTO> dtos = asignaciones.stream().map(a -> {
            FuncionarioAsignadoDTO dto = new FuncionarioAsignadoDTO();
            dto.setId(a.getId());
            dto.setIdFuncionario(a.getIdFuncionario());
            dto.setNombreCompleto(a.getNombreCompleto());
            dto.setSiglasCargo(a.getSiglasCargo());
            dto.setAntiguedad(a.getAntiguedad());
            dto.setDiasNoDisponibles(
                    a.getDiasNoDisponibles() != null ?
                            a.getDiasNoDisponibles().stream().map(d -> {
                                FuncionarioDiasNoDisponibleDTO dDto = new FuncionarioDiasNoDisponibleDTO();
                                dDto.setFecha(d.getFecha());
                                dDto.setFechaInicio(d.getFechaInicio());
                                dDto.setFechaFin(d.getFechaFin());
                                dDto.setMotivo(d.getMotivo());
                                dDto.setDetalle(d.getDetalle());
                                return dDto;
                            }).toList() : List.of()
            );
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }
}