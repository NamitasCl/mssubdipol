package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.dto.*;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.service.AsignacionFuncionarioService;
import cl.investigaciones.turnos.service.FuncionarioDiasNoDisponibleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/asignaciones")
@CrossOrigin("*")
public class AsignacionFuncionarioController {

    private final AsignacionFuncionarioService asignacionFuncionarioService;
    private final FuncionarioDiasNoDisponibleService funcionarioDiasNoDisponibleService;

    public AsignacionFuncionarioController(AsignacionFuncionarioService asignacionFuncionarioService,
                                           FuncionarioDiasNoDisponibleService funcionarioDiasNoDisponibleService) {
        this.asignacionFuncionarioService = asignacionFuncionarioService;
        this.funcionarioDiasNoDisponibleService = funcionarioDiasNoDisponibleService;
    }

    @PostMapping
    public ResponseEntity<?> saveAsignacionFuncionario(@RequestBody FuncionarioAsignadoWrapper infoFuncionariosAsignados) {
        System.out.println("Comenzando el proceso de guardado de asignaciones...");
        System.out.println("Información que llega: " + infoFuncionariosAsignados);

        List<FuncionarioAsignadoDTO> funcionarios = infoFuncionariosAsignados.getFuncionarios();

        if (funcionarios == null || funcionarios.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay funcionarios asignados");
        }

        try {
            funcionarios.forEach(funcionario -> {
                System.out.println("Asignación de: " + funcionario.getNombreCompleto());

                AsignacionFuncionario asignacionFuncionario = new AsignacionFuncionario();
                asignacionFuncionario.setIdFuncionario(funcionario.getId());
                asignacionFuncionario.setNombreCompleto(funcionario.getNombreCompleto());
                asignacionFuncionario.setSiglasCargo(funcionario.getSiglasCargo());
                asignacionFuncionario.setAntiguedad(funcionario.getAntiguedad());
                asignacionFuncionario.setUnidad(infoFuncionariosAsignados.getUnidad());
                asignacionFuncionario.setMes(infoFuncionariosAsignados.getMes());
                asignacionFuncionario.setAnio(infoFuncionariosAsignados.getAnio());

                AsignacionFuncionario savedAsignacion = asignacionFuncionarioService.saveOrUpdate(asignacionFuncionario);

                List<FuncionarioDiasNoDisponibleDTO> diasNoDisponibleDto = funcionario.getDiasNoDisponibles();

                if (diasNoDisponibleDto != null && !diasNoDisponibleDto.isEmpty()) {
                    for (FuncionarioDiasNoDisponibleDTO diasNoDisponible : diasNoDisponibleDto) {
                        FuncionarioDiasNoDisponible funcionarioDiasNoDisponible = new FuncionarioDiasNoDisponible();
                        funcionarioDiasNoDisponible.setFecha(diasNoDisponible.getFecha());
                        funcionarioDiasNoDisponible.setFechaInicio(diasNoDisponible.getFechaInicio());
                        funcionarioDiasNoDisponible.setFechaFin(diasNoDisponible.getFechaFin());
                        funcionarioDiasNoDisponible.setMotivo(diasNoDisponible.getMotivo());
                        funcionarioDiasNoDisponible.setDetalle(diasNoDisponible.getDetalle());
                        funcionarioDiasNoDisponible.setIdentificadorFuncionario(savedAsignacion);
                        funcionarioDiasNoDisponibleService.save(funcionarioDiasNoDisponible);
                    }
                }
            });

            return ResponseEntity.ok("Asignaciones guardadas/actualizadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al guardar asignaciones: " + e.getMessage());
        }
    }

    @GetMapping("/consultar")
    public ResponseEntity<?> getAsignacionesFuncionarios(@RequestParam int mes,
                                                         @RequestParam int anio,
                                                         @RequestParam String unidad) {
        System.out.println("Consultando asignaciones de funcionarios para el mes: " + mes + ", año: " + anio + ", unidad: " + unidad);

        try {
            List<FuncionarioAsignadoDTO> asignacionesDTO = asignacionFuncionarioService.getAsignacionesConDiasNoDisponibles(mes, anio, unidad);

            if (asignacionesDTO.isEmpty()) {
                return ResponseEntity.ok("No hay asignaciones para el mes y año especificados");
            }

            return ResponseEntity.ok(asignacionesDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar asignaciones: " + e.getMessage());
        }
    }

    @GetMapping("/disponibles")
    public ResponseEntity<?> getFuncionariosDisponibles(@RequestParam int selectedMes,
                                                        @RequestParam int selectedAnio) {
        try {
            return ResponseEntity.ok(asignacionFuncionarioService.findFuncionariosDisponibles(selectedMes, selectedAnio));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar funcionarios disponibles: " + e.getMessage());
        }
    }
}