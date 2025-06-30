package cl.investigaciones.turnos.plantilla.controller;

import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
public class RolServicioController {
    @GetMapping("/api/turnos/enumtype/roles-servicio")
    public List<Map<String, String>> listarRolesServicio() {
        return Arrays.stream(RolServicio.values())
                .map(r -> Map.of(
                        "value", r.name(),
                        "label", r.getLabel()
                ))
                .toList();
    }
}
