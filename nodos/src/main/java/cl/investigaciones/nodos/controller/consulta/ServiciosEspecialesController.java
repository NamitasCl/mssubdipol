package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import cl.investigaciones.nodos.service.consulta.ServiciosEspecialesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nodos/servicios-especiales")
public class ServiciosEspecialesController {

    private final ServiciosEspecialesService serviciosEspecialesService;

    public ServiciosEspecialesController(ServiciosEspecialesService serviciosEspecialesService) {
        this.serviciosEspecialesService = serviciosEspecialesService;
    }

    @PostMapping
    public ResponseEntity<?> listar(@RequestBody FichaMemoRequestDTO req) {
        try {
            return ResponseEntity.ok(serviciosEspecialesService.listarMemos(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
