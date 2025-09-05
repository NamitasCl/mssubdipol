package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import cl.investigaciones.nodos.dto.serviciosespeciales.FichaPersonasRequestDTO;
import cl.investigaciones.nodos.service.consulta.ServiciosEspecialesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            return ResponseEntity.ok(serviciosEspecialesService.listarMemosConEstado(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/ids")
    public ResponseEntity<?> listarMemosPorIds(@RequestBody FichaMemoRequestDTO req) {
        try {
            List<Long> ids = req.getMemoIds();
            return ResponseEntity.ok(serviciosEspecialesService.listarMemosPorIdConEstado(ids));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/personas")
    public void listarPersonas(@RequestBody FichaPersonasRequestDTO req) {


    }
}
