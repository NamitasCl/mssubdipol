package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import cl.investigaciones.nodos.dto.serviciosespeciales.FichaPersonasRequestDTO;
import cl.investigaciones.nodos.service.consulta.EstadisticasService;
import cl.investigaciones.nodos.service.consulta.ServiciosEspecialesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodos/servicios-especiales")
public class ServiciosEspecialesController {

    private final ServiciosEspecialesService serviciosEspecialesService;
    private final EstadisticasService estadisticasService;

    public ServiciosEspecialesController(ServiciosEspecialesService serviciosEspecialesService, EstadisticasService estadisticasService) {
        this.serviciosEspecialesService = serviciosEspecialesService;
        this.estadisticasService = estadisticasService;
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

    @PostMapping("/estadisticas")
    public ResponseEntity<?> generarEstadisticas(@RequestBody FichaMemoRequestDTO req) {
        try {
            return ResponseEntity.ok(estadisticasService.generarEstadisticas(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/personas")
    public void listarPersonas(@RequestBody FichaPersonasRequestDTO req) {


    }
}
