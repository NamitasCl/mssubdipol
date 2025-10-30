package cl.investigaciones.turnosv2.service;

import ai.timefold.solver.core.api.solver.SolutionManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import cl.investigaciones.turnosv2.domain.*;
import cl.investigaciones.turnosv2.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CalendarioConfigService {

    // --- Inyección de todos los Repositorios ---
    @Autowired
    private CalendarioRepository calendarioRepository;
    @Autowired
    private DiaCalendarioRepository diaCalendarioRepository;
    @Autowired
    private PlantillaRequerimientoRepository plantillaRepository;
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    @Autowired
    private AsignacionRepository asignacionRepository;
    @Autowired
    private UnidadParticipanteRepository unidadRepository;

    // --- ¡Inyección del Solver de OptaPlanner! ---
    @Autowired
    private SolutionManager<PlanificacionTurnos, Long> solutionManager; // <-- ¡ESTO ES CORRECTO!


    // --- MÉTODOS DE FASE 1 (Llamados por el Controller) ---

    public Calendario createCalendario(Calendario calendario) {
        // Lógica para asegurar que las unidades están conectadas
        List<UnidadParticipante> unidades = unidadRepository.findAllById(
                calendario.getUnidadParticipantes().stream().map(UnidadParticipante::getId).collect(Collectors.toList())
        );
        calendario.setUnidadParticipantes(unidades);
        calendario.setEstado(cl.investigaciones.turnosv2.domain.enums.EstadoCalendario.EN_CONFIGURACION);
        return calendarioRepository.save(calendario);
    }

    @Transactional(readOnly = true)
    public List<Calendario> findAllCalendarios() {
        return calendarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Calendario findCalendarioById(Long id) {
        return calendarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Calendario no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<DiaCalendario> findDiasByCalendario(Long calendarioId) {
        return diaCalendarioRepository.findByCalendarioId(calendarioId);
    }

    public List<DiaCalendario> habilitarDias(Long calendarioId, List<LocalDate> fechas) {
        Calendario calendario = findCalendarioById(calendarioId);
        List<DiaCalendario> nuevosDias = new ArrayList<>();
        for (LocalDate fecha : fechas) {
            DiaCalendario dia = new DiaCalendario();
            dia.setCalendario(calendario);
            dia.setFecha(fecha);
            // plantillaRequerimiento es null por defecto
            nuevosDias.add(dia);
        }
        return diaCalendarioRepository.saveAll(nuevosDias);
    }

    public void asignarPlantilla(List<Long> diaIds, Long plantillaId) {
        PlantillaRequerimiento plantilla = plantillaRepository.findById(plantillaId)
                .orElseThrow(() -> new EntityNotFoundException("Plantilla no encontrada: " + plantillaId));

        List<DiaCalendario> dias = diaCalendarioRepository.findAllById(diaIds);
        for (DiaCalendario dia : dias) {
            dia.setPlantillaRequerimiento(plantilla);
        }
        diaCalendarioRepository.saveAll(dias);
    }

    // --- FASE 1: Botón "1. Generar Slots" ---
    public void generarSlots(Long calendarioId) {
        Calendario calendario = findCalendarioById(calendarioId);
        List<DiaCalendario> dias = diaCalendarioRepository.findByCalendarioId(calendarioId);
        List<Slot> slotsAGenerar = new ArrayList<>();

        for (DiaCalendario dia : dias) {
            if (dia.getPlantillaRequerimiento() != null) {
                // Leemos la plantilla y sus requerimientos (1 Jefe, 2 Ayudantes...)
                PlantillaRequerimiento plantilla = dia.getPlantillaRequerimiento();
                for (RequerimientoDia req : plantilla.getRequerimientos()) {
                    // Creamos 'cantidad' slots para ese rol/día
                    for (int i = 0; i < req.getCantidad(); i++) {
                        Slot slot = new Slot();
                        slot.setCalendario(calendario);
                        slot.setFecha(dia.getFecha());
                        slot.setRolRequerido(req.getRol());
                        slotsAGenerar.add(slot);
                    }
                }
            }
        }
        slotRepository.saveAll(slotsAGenerar);
    }


    // --- FASE 2: Botón "2. Generar Turnos" (¡La llamada a OptaPlanner!) ---
    public void resolverTurnos(Long calendarioId) {
        Calendario calendario = findCalendarioById(calendarioId);

        // 1. Cargar Oferta (Funcionarios)
        List<Long> unidadIds = calendario.getUnidadParticipantes().stream()
                .map(UnidadParticipante::getId).collect(Collectors.toList());
        List<Funcionario> funcionarios = funcionarioRepository.findByIdUnidadIn(unidadIds);

        // 2. Cargar Demanda (Slots)
        List<Slot> slots = slotRepository.findByCalendarioId(calendarioId);

        // 3. Preparar Decisión (Asignaciones vacías)
        List<Asignacion> asignacionesVacias = new ArrayList<>();
        for (Slot slot : slots) {
            asignacionesVacias.add(new Asignacion(slot)); // 'funcionario' es null
        }

        // 4. Empaquetar el problema
        PlanificacionTurnos problema = new PlanificacionTurnos(
                calendarioId, funcionarios, slots, asignacionesVacias
        );

        // 5. ¡LLAMAR AL GENIO! (OptaPlanner)
        // (Nota: solve() puede tardar. Para producción se usa solveAndListen())
        SolverStatus status = solutionManager.getSolverStatus(problema.getCalendarioId());
        if (status != SolverStatus.NOT_SOLVING) {
            throw new IllegalStateException("El solver ya está corriendo para este calendario.");
        }
        PlanificacionTurnos solucion = solutionManager.solve(problema.getCalendarioId(), problema);

        // 6. Guardar la solución
        if (solucion.getScore().isFeasible()) {
            // ¡La solución es viable! La guardamos.
            asignacionRepository.saveAll(solucion.getAsignaciones());

            // Actualizamos el estado del calendario
            calendario.setEstado(cl.investigaciones.turnosv2.domain.enums.EstadoCalendario.RESUELTO);
            calendarioRepository.save(calendario);
        } else {
            // La solución no es viable (rompe reglas duras)
            throw new RuntimeException("No se pudo encontrar una solución viable. Revisa las reglas o los datos.");
        }
    }
}