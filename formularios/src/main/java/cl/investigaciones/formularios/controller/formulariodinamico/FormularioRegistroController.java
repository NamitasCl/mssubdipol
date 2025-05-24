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

    // Supón que tienes la info del usuario autenticado (ajusta según tu seguridad)
    @PostMapping
    public ResponseEntity<FormularioRegistroResponseDTO> guardarRegistro(
            @RequestBody FormularioRegistroRequestDTO dto,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        // Si tu JwtUserPrincipal tiene un id:
        Integer usuarioId = principal.getIdFuncionario();
        return ResponseEntity.ok(service.guardarRegistro(usuarioId, dto));
    }

    @GetMapping("/{formularioId}")
    public ResponseEntity<List<FormularioRegistroResponseDTO>> listarPorFormulario(@PathVariable Long formularioId) {
        return ResponseEntity.ok(service.listarPorFormulario(formularioId));
    }
}

