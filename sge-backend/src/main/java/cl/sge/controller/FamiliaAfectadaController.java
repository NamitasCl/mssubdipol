package cl.sge.controller;

import cl.sge.entity.FamiliaAfectada;
import cl.sge.service.FamiliaAfectadaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/familia-afectada")
public class FamiliaAfectadaController {

    private final FamiliaAfectadaService service;
    private final cl.sge.service.ExcelService excelService;

    public FamiliaAfectadaController(FamiliaAfectadaService service, cl.sge.service.ExcelService excelService) {
        this.service = service;
        this.excelService = excelService;
    }

    @GetMapping
    public ResponseEntity<List<FamiliaAfectada>> getAll(@RequestParam(required = false) Long eventoId) {
        if (eventoId != null) {
            return ResponseEntity.ok(service.findByEvento(eventoId));
        }
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/export")
    public ResponseEntity<org.springframework.core.io.Resource> exportToExcel(@RequestParam(required = false) Long eventoId) throws java.io.IOException {
        java.io.ByteArrayInputStream in = excelService.generateAfectadosReport(eventoId);
        
        org.springframework.core.io.InputStreamResource resource = new org.springframework.core.io.InputStreamResource(in);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=afectados.xlsx")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @PostMapping
    public ResponseEntity<FamiliaAfectada> create(@RequestBody Map<String, Object> payload) {
        // Extract fields manually to handle Evento linking cleanly
        Long eventoId = Long.valueOf(payload.get("eventoId").toString());
        
        FamiliaAfectada fa = new FamiliaAfectada();
        fa.setFuncionarioId(payload.get("funcionarioId").toString());
        fa.setFuncionarioNombre((String) payload.get("funcionarioNombre"));
        fa.setFuncionarioRut((String) payload.get("funcionarioRut"));
        
        fa.setNombreCompleto((String) payload.get("nombreCompleto"));
        fa.setRut((String) payload.get("rut")); // Family rut
        fa.setTelefono((String) payload.get("telefono"));
        fa.setParentesco((String) payload.get("parentesco"));
        fa.setTipoBienAfectado((String) payload.get("tipoBienAfectado"));
        fa.setDireccion((String) payload.get("direccion"));
        fa.setDetalle((String) payload.get("detalle"));

        return ResponseEntity.ok(service.create(eventoId, fa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
