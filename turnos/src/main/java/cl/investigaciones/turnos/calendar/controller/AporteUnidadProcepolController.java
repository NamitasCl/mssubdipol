package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.AporteUnidadItemRequestProcepolDTO;
import cl.investigaciones.turnos.calendar.service.AporteUnidadProcepolService;
import cl.investigaciones.turnos.calendar.service.ProcepolSlotGeneradorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/turnos/procepol")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AporteUnidadProcepolController {

    private final AporteUnidadProcepolService service;
    private final ProcepolSlotGeneradorService procepolGeneradorService;

    @PostMapping("/cuota-aporte-unidad")
    public ResponseEntity<Void> guardar(@RequestBody @Validated AporteUnidadItemRequestProcepolDTO request) {
        service.guardarAportes(request);
        procepolGeneradorService.distribuir(request.getIdCalendario());
        return ResponseEntity.noContent().build();
    }
}