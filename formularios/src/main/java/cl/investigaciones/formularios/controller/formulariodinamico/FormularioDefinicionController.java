package cl.investigaciones.formularios.controller.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionResponseDTO;
import cl.investigaciones.formularios.service.formulariodinamico.FormularioDefinicionService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formularios/dinamico")
@CrossOrigin("*")
public class FormularioDefinicionController {

    @Autowired
    private FormularioDefinicionService service;

    @PostMapping("/definicion")
    public ResponseEntity<FormularioDefinicionResponseDTO> crearFormulario(
            @RequestBody FormularioDefinicionRequestDTO dto) {
        return ResponseEntity.ok(service.crearFormulario(dto));
    }

    @GetMapping("/definicion")
    public ResponseEntity<List<FormularioDefinicionResponseDTO>> listarFormularios() {
        return ResponseEntity.ok(service.listarFormulariosActivos());
    }

    @GetMapping("/definicion/{id}")
    public ResponseEntity<FormularioDefinicionResponseDTO> getDefinicionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerDefinicionPorId(id));
    }

    @DeleteMapping("/definicion/{id}")
    public ResponseEntity<Void> eliminarFormulario(@PathVariable Long id) {
        service.eliminarFormulario(id); // Puedes implementar borrado lógico o físico
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


    // ... puedes agregar más endpoints para editar, deshabilitar, etc.

    // Clases internas que no ameritan DTO

    // DTO interno para request body
    @Setter
    @Getter
    public static class EstadoRequest {
        private boolean activo;
    }

}

