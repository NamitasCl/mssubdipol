package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.AporteUnidadItemRequestProcepolDTO;
import cl.investigaciones.turnos.calendar.service.AporteUnidadProcepolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/turnos/procepol")
@RequiredArgsConstructor
public class AporteUnidadProcepolController {

    private final AporteUnidadProcepolService service;

    @PostMapping("/cuota-aporte-unidad")
    public ResponseEntity<Void> guardar(@RequestBody @Validated AporteUnidadItemRequestProcepolDTO request) {
        service.guardarAportes(request);
        return ResponseEntity.noContent().build();
    }
}