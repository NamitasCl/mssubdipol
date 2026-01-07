package cl.investigaciones.turnos.calendar.controller;

import cl.investigaciones.turnos.calendar.domain.ConfiguracionReglas;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.DistribucionRequest;
import cl.investigaciones.turnos.calendar.repository.ConfiguracionReglasRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioDiaNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.calendar.solver.DistribucionResult;
import cl.investigaciones.turnos.calendar.solver.DistribucionSolver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/turnos/distribucion")
@CrossOrigin("*")
@Slf4j
public class DistribucionController {
    
    @Autowired
    private DistribucionSolver solver;
    
    @Autowired
    private SlotRepository slotRepo;
    
    @Autowired
    private FuncionarioAporteRepository funcionarioAporteRepo;
    
    @Autowired
    private FuncionarioDiaNoDisponibleRepository dndRepo;
    
    @Autowired
    private ConfiguracionReglasRepository reglasRepo;
    
    /**
     * Genera distribución optimizada de turnos
     */
    @PostMapping("/generar")
    public ResponseEntity<DistribucionResult> generar(
            @RequestBody DistribucionRequest request
    ) {
        log.info("Generando distribución para calendario {} mes {}/{}", 
                request.getIdCalendario(), request.getMes(), request.getAnio());
        
        try {
            // 1. Cargar slots del calendario
            List<Slot> slots = slotRepo.findAllByIdCalendario(request.getIdCalendario());
            if (slots.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        DistribucionResult.builder()
                                .exitoso(false)
                                .mensaje("No hay slots disponibles para el calendario especificado")
                                .build()
                );
            }
            
            // 2. Cargar funcionarios aportados del mes
            List<Integer> idsFuncionarios = funcionarioAporteRepo
                    .findByIdCalendario(request.getIdCalendario())
                    .stream()
                    .map(fa -> fa.getIdFuncionario())
                    .distinct()
                    .collect(Collectors.toList());
            
            if (idsFuncionarios.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        DistribucionResult.builder()
                                .exitoso(false)
                                .mensaje("No hay funcionarios aportados para este calendario")
                                .build()
                );
            }
            
            // 3. Cargar días no disponibles
            Map<Integer, Set<LocalDate>> diasNoDisponibles = request.getDiasNoDisponiblesOverride();
            if (diasNoDisponibles == null) {
                diasNoDisponibles = cargarDiasNoDisponibles(idsFuncionarios);
            }
            
            // 4. Resolver distribución
            DistribucionResult result = solver.distribuir(
                    idsFuncionarios,
                    slots,
                    diasNoDisponibles,
                    request.getIdConfigReglas()
            );
            
            log.info("Distribución completada: exitoso={}, asignaciones={}, tiempo={}ms",
                    result.isExitoso(),
                    result.getEstadisticas().getTotalAsignaciones(),
                    result.getTiempoEjecucionMs());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error generando distribución", e);
            return ResponseEntity.internalServerError().body(
                    DistribucionResult.builder()
                            .exitoso(false)
                            .mensaje("Error interno: " + e.getMessage())
                            .build()
            );
        }
    }
    
    /**
     * Lista las configuraciones de reglas disponibles
     */
    @GetMapping("/reglas")
    public ResponseEntity<List<ConfiguracionReglas>> listarReglas() {
        return ResponseEntity.ok(reglasRepo.findAll());
    }
    
    /**
     * Obtiene una configuración de reglas específica
     */
    @GetMapping("/reglas/{id}")
    public ResponseEntity<ConfiguracionReglas> obtenerRegla(@PathVariable Long id) {
        return reglasRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Crea una nueva configuración de reglas
     */
    @PostMapping("/reglas")
    public ResponseEntity<ConfiguracionReglas> crearRegla(
            @RequestBody ConfiguracionReglas regla
    ) {
        regla.setId(null); //Forzar creación
        ConfiguracionReglas saved = reglasRepo.save(regla);
        return ResponseEntity.ok(saved);
    }
    
    /**
     * Actualiza una configuración existente
     */
    @PutMapping("/reglas/{id}")
    public ResponseEntity<ConfiguracionReglas> actualizarRegla(
            @PathVariable Long id,
            @RequestBody ConfiguracionReglas regla
    ) {
        return reglasRepo.findById(id)
                .map(existing -> {
                    regla.setId(id);
                    regla.setFechaCreacion(existing.getFechaCreacion());
                    return ResponseEntity.ok(reglasRepo.save(regla));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Elimina una configuración de reglas
     */
    @DeleteMapping("/reglas/{id}")
    public ResponseEntity<Void> eliminarRegla(@PathVariable Long id) {
        if (reglasRepo.existsById(id)) {
            reglasRepo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    private Map<Integer, Set<LocalDate>> cargarDiasNoDisponibles(List<Integer> idsFuncionarios) {
        Map<Integer, Set<LocalDate>> resultado = new HashMap<>();
        
        idsFuncionarios.forEach(idFunc -> {
            Set<LocalDate> diasND = dndRepo.findByIdFuncionario(idFunc)
                    .stream()
                    .map(dnd -> dnd.getFecha())
                    .collect(Collectors.toSet());
            if (!diasND.isEmpty()) {
                resultado.put(idFunc, diasND);
            }
        });
        
        return resultado;
    }
}
