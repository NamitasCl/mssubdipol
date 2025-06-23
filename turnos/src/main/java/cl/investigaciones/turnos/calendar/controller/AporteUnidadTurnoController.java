package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoRequestDTO;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoResponseDTO;
import cl.investigaciones.turnos.calendar.service.AporteUnidadTurnoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos/aportes")
@RequiredArgsConstructor
public class AporteUnidadTurnoController {

    private final AporteUnidadTurnoService service;

    @PostMapping
    public AporteUnidadTurnoResponseDTO guardar(@RequestBody AporteUnidadTurnoRequestDTO dto) {
        return service.guardar(dto);
    }

    @GetMapping("/calendario/{idCalendario}")
    public List<AporteUnidadTurnoResponseDTO> listar(@PathVariable Long idCalendario) {
        return service.listarPorCalendario(idCalendario);
    }
}