package cl.investigaciones.formularios.controller;

import cl.investigaciones.formularios.dto.FormularioServicioEspecialRequest;
import cl.investigaciones.formularios.dto.FormularioServicioEspecialResponse;
import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.model.FormularioServicioEspecial;
import cl.investigaciones.formularios.service.FormularioServicioEspecialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/formularios")
@CrossOrigin("*")
public class FormularioServicioEspecialController {

    private final FormularioServicioEspecialService service;

    public FormularioServicioEspecialController(FormularioServicioEspecialService service) {
        this.service = service;
    }

    @PostMapping("/servicio-especial")
    public ResponseEntity<FormularioServicioEspecialResponse> crearFormulario(
            @RequestBody FormularioServicioEspecialRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal
            ) {

        System.out.println("El usuario es: " + principal);

        return ResponseEntity.ok(service.crearFormulario(request));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<FormularioServicioEspecialResponse>> listarFormulariosDisponibles(
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        List<FormularioServicioEspecial> formularios = service.listarFormulariosDisponibles(principal);
        // Mapear a DTO de respuesta si corresponde
        List<FormularioServicioEspecialResponse> respuesta = formularios.stream()
                .map(FormularioServicioEspecialResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(respuesta);
    }

}

