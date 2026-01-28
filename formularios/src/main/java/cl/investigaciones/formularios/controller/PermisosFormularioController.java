package cl.investigaciones.formularios.controller;

import cl.investigaciones.formularios.dto.FormularioPermisosDto;
import cl.investigaciones.formularios.service.FormularioPermisosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/formularios")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class PermisosFormularioController {

    private final FormularioPermisosService permisosService;

    public PermisosFormularioController(FormularioPermisosService permisosService) {
        this.permisosService = permisosService;
    }

    @GetMapping("/{id}/permisos")
    public ResponseEntity<FormularioPermisosDto> obtenerPermisos(@PathVariable Long id) {
        return ResponseEntity.ok(permisosService.obtenerPermisosPorFormulario(id));
    }

    @PutMapping("/{id}/permisos")
    public ResponseEntity<Void> actualizarPermisos(
            @PathVariable Long id,
            @RequestBody FormularioPermisosDto dto
    ) {
        permisosService.actualizarPermisos(id, dto);
        return ResponseEntity.ok().build();
    }
}

