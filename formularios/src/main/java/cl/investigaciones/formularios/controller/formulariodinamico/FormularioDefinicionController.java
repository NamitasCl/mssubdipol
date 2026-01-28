package cl.investigaciones.formularios.controller.formulariodinamico;

import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionResponseDTO;
import cl.investigaciones.formularios.service.formulariodinamico.FormularioDefinicionService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/formularios/dinamico")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class FormularioDefinicionController {

    @Autowired
    private FormularioDefinicionService service;

    @PostMapping("/definicion")
    public ResponseEntity<FormularioDefinicionResponseDTO> crearFormulario(
            @RequestBody FormularioDefinicionRequestDTO dto,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Integer usuarioId = principal.getIdFuncionario();
        return ResponseEntity.ok(service.crearFormulario(dto, usuarioId));
    }

    @GetMapping("/definicion")
    public ResponseEntity<List<FormularioDefinicionResponseDTO>> listarFormularios() {
        return ResponseEntity.ok(service.listarFormulariosActivos());
    }

    @GetMapping("/definicion/creador/{idCreador}")
    public ResponseEntity<List<FormularioDefinicionResponseDTO>> listarFormulariosByCreador(@PathVariable Integer idCreador) {
        System.out.println("idCreador: " + idCreador);
        return ResponseEntity.ok(service.listarFormulariosActivosByCreador(idCreador));
    }

    @GetMapping("/definicion/{id}")
    public ResponseEntity<FormularioDefinicionResponseDTO> getDefinicionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerDefinicionPorId(id));
    }

    @DeleteMapping("/definicion/{id}")
    public ResponseEntity<Void> eliminarFormulario(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        
        // Validate authorization: only creator or admin can delete
        FormularioDefinicionResponseDTO form = service.obtenerDefinicionPorId(id);
        boolean isCreator = form.getIdCreador() != null && form.getIdCreador().equals(principal.getIdFuncionario());
        boolean isAdmin = principal.getRoles() != null && principal.getRoles().contains("ROLE_ADMINISTRADOR");
        
        if (!isCreator && !isAdmin) {
            return ResponseEntity.status(403).build();
        }
        
        service.eliminarFormulario(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/definicion/{id}/estado")
    public ResponseEntity<FormularioDefinicionResponseDTO> cambiarEstadoFormulario(
            @PathVariable Long id,
            @RequestBody EstadoRequest estadoRequest
    ) {
        FormularioDefinicionResponseDTO dto = service.cambiarEstadoFormulario(id, estadoRequest.isActivo());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/definicion/{id}")
    public ResponseEntity<FormularioDefinicionResponseDTO> actualizarFormulario(
            @PathVariable Long id,
            @RequestBody FormularioDefinicionRequestDTO dto,
            @AuthenticationPrincipal JwtUserPrincipal principal // si quieres validar autoría
    ) throws Exception {
        FormularioDefinicionResponseDTO actualizado = service.actualizarFormulario(id, dto, principal.getIdFuncionario());
        return ResponseEntity.ok(actualizado);
    }


    // ... puedes agregar más endpoints para editar, deshabilitar, etc.

    // Clases internas que no ameritan DTO

    // DTO interno para request body
    @Setter
    @Getter
    public static class EstadoRequest {
        private boolean activo;
    }

}

