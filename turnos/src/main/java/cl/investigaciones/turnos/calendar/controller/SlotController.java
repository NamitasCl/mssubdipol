package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.service.SlotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos/slots")
@CrossOrigin("*")
@Slf4j
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/calendario/{idCalendario}")
    public ResponseEntity<?> getSlotsByIdCalendario(@PathVariable Long idCalendario) {
        try {
            return new ResponseEntity<>(slotService.getSlotsResponseByCalendar(idCalendario), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error obteniendo slots: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/resumen/{idCalendario}")
    public ResponseEntity<?> getSlotCountByIdCalendario(@PathVariable Long idCalendario) {
        try {
            int response = slotService.getCantidadTotalSlotsByCalendar(idCalendario);
            Map<String, Integer> cantidadSlots = new HashMap<>();
            cantidadSlots.put("totalSlots",  response);
            return new ResponseEntity<>(cantidadSlots, HttpStatus.OK);
        }  catch (Exception e) {
            log.error("Error obteniendo cantidad slots: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }



}
