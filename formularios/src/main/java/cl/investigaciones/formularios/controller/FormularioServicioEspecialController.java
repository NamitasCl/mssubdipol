package cl.investigaciones.formularios.controller;

import cl.investigaciones.formularios.dto.FormularioServicioEspecialRequest;
import cl.investigaciones.formularios.dto.FormularioServicioEspecialResponse;
import cl.investigaciones.formularios.service.FormularioServicioEspecialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody FormularioServicioEspecialRequest request) {
        return ResponseEntity.ok(service.crearFormulario(request));
    }
}

