package cl.investigaciones.formularios.controller.formulariodinamico;

import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioAvanceDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroResponseDTO;
import cl.investigaciones.formularios.service.formulariodinamico.FormularioRegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/formularios/dinamicos/registros")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
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

    @GetMapping("/{formularioId}/listar")
    public ResponseEntity<List<FormularioRegistroResponseDTO>> listarMiosPorFormulario(
            @PathVariable Long formularioId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Integer usuarioId = principal.getIdFuncionario();
        List<FormularioRegistroResponseDTO> registros = service.listarPorFormularioYUsuario(formularioId, usuarioId);
        return ResponseEntity.ok(registros != null ? registros : List.of());
    }

    @PutMapping("/{registroId}")
    public ResponseEntity<FormularioRegistroResponseDTO> editarRegistro(
            @PathVariable Long registroId,
            @RequestBody FormularioRegistroRequestDTO dto,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Integer usuarioId = principal.getIdFuncionario();
        return ResponseEntity.ok(service.editarRegistroPropio(registroId, usuarioId, dto));
    }

    @GetMapping("/avance/{formularioId}")
    public ResponseEntity<FormularioAvanceDTO> obtenerAvance(
            @PathVariable Long formularioId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(required = false) String idUnidad,
            @RequestParam(required = false) Integer idUsuario
    ) {
        // Manejar caso cuando no hay autenticación (desarrollo)
        Integer userId = null;
        String siglasUnidad = null;

        if (principal != null) {
            userId = (idUsuario != null) ? idUsuario : principal.getIdFuncionario();
            siglasUnidad = (idUnidad != null) ? idUnidad : principal.getSiglasUnidad();
        } else {
            // En desarrollo sin JWT, usar parámetros opcionales o valores por defecto
            userId = idUsuario;
            siglasUnidad = idUnidad;
        }

        return ResponseEntity.ok(service.obtenerAvance(formularioId, userId, siglasUnidad));
    }

    @DeleteMapping("/{registroId}")
    public ResponseEntity<Void> eliminarRegistro(
            @PathVariable Long registroId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Integer usuarioId = principal.getIdFuncionario();
        service.eliminarRegistroPropio(registroId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/registro/{registroId}")
    public ResponseEntity<FormularioRegistroResponseDTO> obtenerUno(
            @PathVariable Long registroId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Integer usuarioId = principal.getIdFuncionario();
        return ResponseEntity.ok(service.obtenerRegistroPropio(registroId, usuarioId));
    }


}