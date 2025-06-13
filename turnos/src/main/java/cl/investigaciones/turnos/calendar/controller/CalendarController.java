package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.*;
import cl.investigaciones.turnos.calendar.service.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos/calendars")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CalendarController {

    private final CalendarService service;

    /**  GET /api/turnos/calendars   (listar) */
    @GetMapping
    public ResponseEntity<List<CalendarResponseDTO>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<CalendarResponseDTO> create(@Valid @RequestBody CalendarRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PatchMapping("/{id}/quotas")
    public ResponseEntity<Void> addQuotas(@PathVariable Long id,
                                          @Valid @RequestBody List<@Valid UnitQuotaDTO> quotas) {
        service.addQuotas(id, quotas);
        return ResponseEntity.ok().build();
    }
}