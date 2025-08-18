package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.dto.SlotUpdateDTO;
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @RequestBody SlotUpdateDTO slotUpdateDTO) {
        try {
            log.info("Actualizando slot con id: {} con datos: {}", id, slotUpdateDTO);
            return new ResponseEntity<>(slotService.updateSlot(id, slotUpdateDTO), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error actualizando slot: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/batch")
    public ResponseEntity<?> updateSlots(@RequestBody java.util.List<SlotUpdateDTO> slotsUpdate) {
        try {
            log.info("Actualizando {} slots", slotsUpdate.size());
            return new ResponseEntity<>(slotService.updateSlots(slotsUpdate), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error actualizando slots: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/swap")
    public ResponseEntity<?> swapSlots(@RequestBody Map<String, Long> body) {
        try {
            Long slotIdA = body.get("slotIdA");
            Long slotIdB = body.get("slotIdB");
            log.info("Intercambiando asignaciones entre slots {} y {}", slotIdA, slotIdB);
            return new ResponseEntity<>(slotService.swapSlots(slotIdA, slotIdB), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error intercambiando slots: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/funcionarios-por-unidad/{siglasUnidad}")
    public ResponseEntity<?> getFuncionariosByUnidad(@PathVariable String siglasUnidad) {
        try {
            return new ResponseEntity<>(slotService.getFuncionariosByUnidad(siglasUnidad), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error obteniendo funcionarios por unidad: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }




}
