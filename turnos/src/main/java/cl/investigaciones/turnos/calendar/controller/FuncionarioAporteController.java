package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteRequestDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.service.FuncionarioAporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/funcionarios-aporte")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FuncionarioAporteController {

    private final FuncionarioAporteService service;

    // Crear/Agregar funcionario aportado
    @PostMapping
    // @PreAuthorize("hasAnyRole('JEFE_UNIDAD', 'SUBJEFE_UNIDAD')") // Descomenta si usas Spring Security roles
    public ResponseEntity<FuncionarioAporteResponseDTO> agregarFuncionarioAporte(
            @RequestBody FuncionarioAporteRequestDTO dto,
            @RequestHeader("usuario") Integer agregadoPor // o saca del JWT según tu contexto
    ) {
        FuncionarioAporteResponseDTO response = service.guardar(dto, agregadoPor);
        return ResponseEntity.ok(response);
    }

    // Listar funcionarios aportados por calendario y unidad
    @GetMapping("/calendario/{idCalendario}/unidad/{idUnidad}")
    public ResponseEntity<List<FuncionarioAporteResponseDTO>> listarAportes(
            @PathVariable Long idCalendario,
            @PathVariable Long idUnidad
    ) {
        List<FuncionarioAporteResponseDTO> lista = service.listarPorCalendarioYUnidad(idCalendario, idUnidad);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/calendario/{idCalendario}")
    public ResponseEntity<List<FuncionarioAporteResponseDTO>> listarFuncionarios(@PathVariable Long idCalendario) {
        List<FuncionarioAporteResponseDTO> lista = service.listarPorCalendario(idCalendario);
        return ResponseEntity.ok(lista);
    }

    // Eliminar (borrado lógico) funcionario de la lista de aportes
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasAnyRole('JEFE_UNIDAD', 'SUBJEFE_UNIDAD')")
    public ResponseEntity<Void> eliminarFuncionarioAporte(
            @PathVariable Long id,
            @RequestHeader("usuario") Integer modificadoPor
    ) {
        service.eliminar(id, modificadoPor);
        return ResponseEntity.noContent().build();
    }
}