package cl.investigaciones.commonservices.controller;

import cl.investigaciones.commonservices.dto.ConsultaUnidadDto;
import cl.investigaciones.commonservices.dto.UnidadPorRegionRequestDTO;
import cl.investigaciones.commonservices.dto.jerarquiaunidades.RegionesJefaturasDTO;
import cl.investigaciones.commonservices.service.UnidadesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common/unidades")
@CrossOrigin("*")
public class ConsultaUnidadesController {

    @Autowired
    private UnidadesService unidadesService;

    @GetMapping("/actualizarbase")
    public ResponseEntity<?> cronSaveUnidades() {
        try {
            unidadesService.cronSaveUnidad();
            return ResponseEntity.ok("Unidades guardadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al guardar unidades: " + e.getMessage());
        }
    }

    @GetMapping("/{idUnidad}")
    public ResponseEntity<?> getUnidadByIdUnidad(@PathVariable Integer idUnidad) {
        try {
            System.out.println("[getUnidadByIdUnidad] IdUnidad: " + idUnidad);
            ConsultaUnidadDto unidad = unidadesService.getUnidadByIdUnidad(idUnidad);
            return ResponseEntity.ok(unidad);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar unidad: " + e.getMessage());
        }
    }

    @GetMapping("/sigla/{siglasUnidad}")
    public ResponseEntity<?> getUnidadBySiglasUnidad(@PathVariable String siglasUnidad) {
        try {
            ConsultaUnidadDto unidad = unidadesService.getUnidadBySiglasUnidad(siglasUnidad);
            return ResponseEntity.ok(unidad);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar unidad: " + e.getMessage());
        }
    }


    @GetMapping("/buscar")
    public ResponseEntity<?> buscarUnidadesPorNombre(@RequestParam String nombre) {
        try {
            List<ConsultaUnidadDto> unidades = unidadesService.buscarUnidadesPorNombre(nombre);
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al buscar unidades: " + e.getMessage());
        }
    }

    @GetMapping("/regiones-policiales")
    public List<String> getRegionesPolicialesUnicas() {
        return unidadesService.getRegionesPolicialesUnicas();
    }

    /**
     * Obtiene distinct de regiones de las unidades registradas
     */
    @GetMapping("/regiones")
    public ResponseEntity<?> getRegionesUnicas() {
        try {
            List<String> regiones = unidadesService.getRegionesUnicas();
            return ResponseEntity.ok(regiones);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener regiones: " + e.getMessage());
        }
    }

    /**
     * Obtiene las unidades asociadas a una region
     */
    @PostMapping("/region")
    public ResponseEntity<?> getUnidadesPorRegion(@RequestBody UnidadPorRegionRequestDTO region) {
        try {
            List<ConsultaUnidadDto> unidades = unidadesService.getUnidadesPorRegion(region.getRegion());
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener regiones: " + e.getMessage());
        }
    }

    @GetMapping("/jefaturasnacionalesprefecturas")
    public ResponseEntity<?> getJefaturasNacionalesPrefecturas() {
        try {
            List<String> unidades = unidadesService.getJefaturasNacionalesPrefecturas();
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener regiones: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUnidades() {
        try {
            List<RegionesJefaturasDTO> unidades = unidadesService.getJefaturasRegionesUudd();
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener regiones: " + e.getMessage());
        }
    }

    @GetMapping("/contexto")
    public ResponseEntity<?> getUnitContext(@RequestParam String unidad) {
        try {
            cl.investigaciones.commonservices.dto.UnitContextDTO context = unidadesService.getUnitContext(unidad);
            return ResponseEntity.ok(context);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener contexto: " + e.getMessage());
        }
    }


}