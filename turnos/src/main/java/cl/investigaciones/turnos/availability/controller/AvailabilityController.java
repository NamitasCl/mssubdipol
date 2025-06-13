package cl.investigaciones.turnos.availability.controller;

import cl.investigaciones.turnos.availability.dto.*;
import cl.investigaciones.turnos.availability.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos/availability")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AvailabilityController {

    private final AvailabilityService service;

    @PostMapping
    public ResponseEntity<AvailabilityResponseDTO> register(@Valid @RequestBody AvailabilityRequestDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> registerBulk(@Valid @RequestBody List<@Valid AvailabilityRequestDTO> list) {
        service.registerBulk(list);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/calendar/{calendarId}")
    public ResponseEntity<List<AvailabilityResponseDTO>> listByCalendar(@PathVariable Long calendarId) {
        return ResponseEntity.ok(service.listByCalendar(calendarId));
    }
}