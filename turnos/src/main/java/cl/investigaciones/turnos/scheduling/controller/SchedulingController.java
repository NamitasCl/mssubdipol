package cl.investigaciones.turnos.scheduling.controller;

import cl.investigaciones.turnos.scheduling.dto.ScheduleResponseDTO;
import cl.investigaciones.turnos.scheduling.service.SchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/turnos/schedule")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SchedulingController {

    private final SchedulingService service;

    @PostMapping("/{calendarId}/generate")
    public ResponseEntity<ScheduleResponseDTO> generate(@PathVariable Long calendarId) {
        return ResponseEntity.ok(service.generate(calendarId));
    }
}