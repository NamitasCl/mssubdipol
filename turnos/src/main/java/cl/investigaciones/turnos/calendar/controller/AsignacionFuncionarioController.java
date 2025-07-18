package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.service.AsignacionFuncionariosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/asignacion-funcionario")
public class AsignacionFuncionarioController {

    private final AsignacionFuncionariosService asignacionFuncionariosService;

    public AsignacionFuncionarioController(AsignacionFuncionariosService asignacionFuncionariosService) {
        this.asignacionFuncionariosService = asignacionFuncionariosService;
    }

    @GetMapping("/{idCalendario}")
    public ResponseEntity<?> asignarFuncionarios(@PathVariable Long idCalendario) {

        try {
            /*// Definir restricciones
            List<Restriccion> restricciones = List.of(
                    new RestriccionMaximoTurnos(2),
                    new RestriccionMaxUnaNochePorSemana(),
                    new RestriccionUnSoloRolPorServicio(),
                    new RestriccionNoDisponible(),
                    new RestriccionSeparacionDias(3),
                    new RestriccionMaximoTurnosFinDeSemana(2),
                    new RestriccionJerarquiaRolServicio()
                    *//*new RestriccionDummy()*//*
            );*/

            // Asignar funcionarios al calendario 1 (ejemplo)
            System.out.println("Iniciando proceso de asignacion en calendario: " +  idCalendario);
            List<Slot> slotsAsignados = asignacionFuncionariosService.asignarFuncionarios(idCalendario);

            // Retornar los slots asignados
            return ResponseEntity.ok(slotsAsignados);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al asignar funcionarios: " + e.getMessage());
        }
    }

}
