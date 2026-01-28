package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalRequest;
import cl.investigaciones.turnos.calendar.service.FuncionarioDiaNoDisponibleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/turnos/dianodisponible")
@PreAuthorize("isAuthenticated()")
public class FuncionarioDiaNoDisponibleController {

    @Autowired
    private FuncionarioDiaNoDisponibleService service;

    @GetMapping("/listar/{idFuncionario}")
    public ResponseEntity<?> listar(@PathVariable Integer idFuncionario){
        return ResponseEntity.ok(service.findByIdFuncionario(idFuncionario));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(
            @RequestBody DiaNoDisponibleGlobalRequest dias
    ) {
        try {
            service.registrarDiasNoDisponibles(dias.getIdFuncionario(), dias);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

