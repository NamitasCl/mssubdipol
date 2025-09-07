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

    // ✅ NUEVO ENDPOINT PARA CONSULTA GLOBAL PMSUBDIPOL
    @PostMapping("/pmsubdipol/global")
    public ResponseEntity<?> consultaGlobalPMSUBDIPOL(@RequestBody FichaMemoRequestDTO req) {
        try {
            System.out.println("[PMSUBDIPOL] Consulta global iniciada con filtros: " + req);

            // Construir un filtro que sólo conserve los 4 parámetros permitidos
            FichaMemoRequestDTO filtroGlobal = new FichaMemoRequestDTO();
            filtroGlobal.setFechaInicioUtc(req.getFechaInicioUtc());
            filtroGlobal.setFechaTerminoUtc(req.getFechaTerminoUtc());
            filtroGlobal.setTipoFecha(req.getTipoFecha());
            filtroGlobal.setFiltroDetenidos(req.getFiltroDetenidos()); // Aplicar filtro de detenidos si viene
            // Si tipoMemo es "TODOS" o null, no setearlo (quedará null) para no filtrar por tipo
            if (req.getTipoMemo() != null && !"TODOS".equals(req.getTipoMemo())) {
                filtroGlobal.setTipoMemo(req.getTipoMemo());
            }
            // Importante: no setear unidades, unidad, región, ni memoIds para evitar restricciones

            var resultados = serviciosEspecialesService.listarMemosConEstado(filtroGlobal);
            System.out.println("[PMSUBDIPOL] Se encontraron " + (resultados != null ? resultados.size() : 0) + " memos globales");

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            System.err.println("[PMSUBDIPOL] Error en consulta global: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error en consulta global: " + e.getMessage());
        }
    }

    @GetMapping("/personas")
    public void listarPersonas(@RequestBody FichaPersonasRequestDTO req) {


    }
}
