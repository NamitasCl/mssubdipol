package cl.investigaciones.turnosv2.controller;

import cl.investigaciones.turnosv2.domain.Calendario;
import cl.investigaciones.turnosv2.domain.DiaCalendario;
import cl.investigaciones.turnosv2.dto.AsignarPlantillaDTO;
import cl.investigaciones.turnosv2.dto.HabilitarDiasDTO;
import cl.investigaciones.turnosv2.service.CalendarioConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendarios") // Ruta base para todo lo relacionado a calendarios
public class CalendarioController {

    @Autowired
    private CalendarioConfigService calendarioConfigService; // El Service principal

    // --- MÓDULO 2: Dashboard de Calendarios ---

    // GET /api/calendarios
    // (Usado por CalendariosPage para el dashboard)
    @GetMapping
    public ResponseEntity<List<Calendario>> getAllCalendarios() {
        return ResponseEntity.ok(calendarioConfigService.findAllCalendarios());
    }

    // POST /api/calendarios
    // (Usado por CalendarioForm para crear uno nuevo)
    @PostMapping
    public ResponseEntity<Calendario> createCalendario(@RequestBody Calendario calendario) {
        Calendario nuevoCalendario = calendarioConfigService.createCalendario(calendario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCalendario);
    }

    // GET /api/calendarios/{id}
    // (Usado por ConfiguracionCalendarioPage para cargar el calendario actual)
    @GetMapping("/{id}")
    public ResponseEntity<Calendario> getCalendarioById(@PathVariable Long id) {
        return ResponseEntity.ok(calendarioConfigService.findCalendarioById(id));
    }


    // --- MÓDULO 3: Configuración de Días ---

    // GET /api/calendarios/{id}/dias
    // (Usado por ConfiguracionCalendarioPage para cargar los DiaCalendario)
    @GetMapping("/{id}/dias")
    public ResponseEntity<List<DiaCalendario>> getDiasCalendario(@PathVariable Long id) {
        return ResponseEntity.ok(calendarioConfigService.findDiasByCalendario(id));
    }

    // POST /api/calendarios/{id}/dias/habilitar
    // (Usado por el botón "Habilitar Días")
    @PostMapping("/{id}/dias/habilitar")
    public ResponseEntity<List<DiaCalendario>> habilitarDias(@PathVariable Long id, @RequestBody HabilitarDiasDTO dto) {
        // DTO (Data Transfer Object) es un objeto simple que solo trae las fechas
        List<DiaCalendario> nuevosDias = calendarioConfigService.habilitarDias(id, dto.getFechas());
        return ResponseEntity.ok(nuevosDias);
    }

    // PUT /api/dias/asignar-plantilla
    // (Usado por el botón "Asignar Plantilla")
    // (Nota: Lo saqué de /calendarios para que sea más genérico)
    @PutMapping("/dias/asignar-plantilla")
    public ResponseEntity<?> asignarPlantilla(@RequestBody AsignarPlantillaDTO dto) {
        // DTO trae la lista de IDs de DiaCalendario y el ID de la plantilla
        calendarioConfigService.asignarPlantilla(dto.getDiaIds(), dto.getPlantillaId());
        return ResponseEntity.ok().build();
    }


    // --- MÓDULO 3: Botones Mágicos ---

    // POST /api/calendarios/{id}/generar-slots
    // (Botón 1)
    @PostMapping("/{id}/generar-slots")
    public ResponseEntity<String> generarSlots(@PathVariable Long id) {
        calendarioConfigService.generarSlots(id);
        return ResponseEntity.ok("Slots generados correctamente");
    }

    // POST /api/calendarios/{id}/resolver-turnos
    // (Botón 2: ¡Llama a OptaPlanner!)
    @PostMapping("/{id}/resolver-turnos")
    public ResponseEntity<String> resolverTurnos(@PathVariable Long id) {
        // Este es el service que llamará a OptaPlanner
        calendarioConfigService.resolverTurnos(id);
        return ResponseEntity.ok("Turnos generados y resueltos");
    }
}