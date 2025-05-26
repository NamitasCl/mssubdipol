package cl.investigaciones.formularios.controller.formulariodinamico;

import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroResponseDTO;
import cl.investigaciones.formularios.service.formulariodinamico.FormularioRegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formularios/dinamicos/registros")
@CrossOrigin("*")
public class FormularioRegistroController {

    @Autowired
    private FormularioRegistroService service;

    // Guarda registro, igual que antes
    @PostMapping
    public ResponseEntity<FormularioRegistroResponseDTO> guardarRegistro(
            @RequestBody FormularioRegistroRequestDTO dto,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Integer usuarioId = principal.getIdFuncionario();
        return ResponseEntity.ok(service.guardarRegistro(usuarioId, dto));
    }

    // Retorna SIEMPRE array, nunca null
    @GetMapping("/{formularioId}")
    public ResponseEntity<List<FormularioRegistroResponseDTO>> listarPorFormulario(@PathVariable Long formularioId) {
        List<FormularioRegistroResponseDTO> registros = service.listarPorFormulario(formularioId);
        return ResponseEntity.ok(registros != null ? registros : List.of());
    }

    // Puedes dejar este handler dentro del mismo archivo SOLO PARA DESARROLLO,
    // o muévelo a una clase @RestControllerAdvice en producción.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAll(Exception ex) {
        ex.printStackTrace(); // 👈 Siempre imprime en consola/log de Docker
        return ResponseEntity.status(500).body("Error interno del servidor: " + ex.getMessage());
    }
}