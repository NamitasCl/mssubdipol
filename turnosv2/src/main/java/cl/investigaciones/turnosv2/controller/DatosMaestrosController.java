package cl.investigaciones.turnosv2.controller;

// ... (imports)

import cl.investigaciones.turnosv2.domain.UnidadParticipante;
import cl.investigaciones.turnosv2.domain.enums.RolServicio;
import cl.investigaciones.turnosv2.service.DatosMaestrosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api") // Ruta base
public class DatosMaestrosController {

    @Autowired
    private DatosMaestrosService datosMaestrosService;

    // GET /api/enums/roles-servicio
    // (Usado por PlantillaForm para el dropdown de roles)
    @GetMapping("/enums/roles-servicio")
    public ResponseEntity<List<RolServicio>> getRolesServicio() {
        return ResponseEntity.ok(List.of(RolServicio.values()));
    }

    // GET /api/unidades
    // (Usado por CalendarioForm para el checklist de unidades)
    @GetMapping("/unidades")
    public ResponseEntity<List<UnidadParticipante>> getUnidades() {
        return ResponseEntity.ok(datosMaestrosService.findAllUnidades());
    }
}