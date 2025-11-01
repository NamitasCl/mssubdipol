package cl.investigaciones.turnosv2.service;

import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.solver.SolutionManager;
import ai.timefold.solver.core.api.solver.SolverJob;
import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import cl.investigaciones.turnosv2.domain.Asignacion;
import cl.investigaciones.turnosv2.domain.Calendario;
import cl.investigaciones.turnosv2.domain.DiaCalendario;
import cl.investigaciones.turnosv2.domain.Funcionario;
import cl.investigaciones.turnosv2.domain.PlanificacionTurnos;
import cl.investigaciones.turnosv2.domain.PlantillaRequerimiento;
import cl.investigaciones.turnosv2.domain.RequerimientoDia;
import cl.investigaciones.turnosv2.domain.Slot;
import cl.investigaciones.turnosv2.domain.UnidadParticipante;
import cl.investigaciones.turnosv2.domain.enums.EstadoCalendario;
import cl.investigaciones.turnosv2.repository.AsignacionRepository;
import cl.investigaciones.turnosv2.repository.CalendarioRepository;
import cl.investigaciones.turnosv2.repository.DiaCalendarioRepository;
import cl.investigaciones.turnosv2.repository.FuncionarioRepository;
import cl.investigaciones.turnosv2.repository.PlantillaRequerimientoRepository;
import cl.investigaciones.turnosv2.repository.SlotRepository;
import cl.investigaciones.turnosv2.repository.UnidadParticipanteRepository;
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

    // --- Repositorios ---
    @Autowired private CalendarioRepository calendarioRepository;
    @Autowired private DiaCalendarioRepository diaCalendarioRepository;
    @Autowired private PlantillaRequerimientoRepository plantillaRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private AsignacionRepository asignacionRepository;
    @Autowired private UnidadParticipanteRepository unidadRepository;

    // --- Timefold ---
    // SolverManager: ejecuta el solver (ID del problema = Long)
    @Autowired
    private SolverManager<PlanificacionTurnos, Long> solverManager;

    // SolutionManager: útil para explicar el score (Score = HardSoftScore)
    @Autowired
    private SolutionManager<PlanificacionTurnos, HardSoftScore> solutionManager;

    // --- FASE 1 ---

    public Calendario createCalendario(Calendario calendario) {
        List<UnidadParticipante> unidades = unidadRepository.findAllById(
                calendario.getUnidadParticipantes().stream()
                        .map(UnidadParticipante::getId)
                        .collect(Collectors.toList())
        );
        calendario.setUnidadParticipantes(unidades);
        calendario.setEstado(EstadoCalendario.EN_CONFIGURACION);
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

    // --- FASE 1: Generar Slots según plantilla ---
    public void generarSlots(Long calendarioId) {
        Calendario calendario = findCalendarioById(calendarioId);
        List<DiaCalendario> dias = diaCalendarioRepository.findByCalendarioId(calendarioId);
        List<Slot> slotsAGenerar = new ArrayList<>();

        for (DiaCalendario dia : dias) {
            if (dia.getPlantillaRequerimiento() != null) {
                PlantillaRequerimiento plantilla = dia.getPlantillaRequerimiento();
                for (RequerimientoDia req : plantilla.getRequerimientos()) {
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

    // --- FASE 2: Resolver Turnos con Timefold ---
    public void resolverTurnos(Long calendarioId) {
        Calendario calendario = findCalendarioById(calendarioId);

        // 1) Oferta: funcionarios de las unidades participantes
        List<Long> unidadIds = calendario.getUnidadParticipantes().stream()
                .map(UnidadParticipante::getId)
                .collect(Collectors.toList());
        List<Funcionario> funcionarios = funcionarioRepository.findByIdUnidadIn(unidadIds);

        // 2) Demanda: slots del calendario
        List<Slot> slots = slotRepository.findByCalendarioId(calendarioId);

        // 3) Decisiones: asignaciones vacías (funcionario = null)
        List<Asignacion> asignacionesVacias = new ArrayList<>();
        for (Slot slot : slots) {
            asignacionesVacias.add(new Asignacion(slot));
        }

        // 4) Problema de planificación
        PlanificacionTurnos problema = new PlanificacionTurnos(
                calendarioId, funcionarios, slots, asignacionesVacias
        );

        // 5) Estado del solver
        SolverStatus status = solverManager.getSolverStatus(calendarioId);
        if (status != SolverStatus.NOT_SOLVING) {
            throw new IllegalStateException("El solver ya está corriendo para este calendario: " + calendarioId);
        }

        try {
            // 6) Ejecutar solver y obtener la mejor solución final
            SolverJob<PlanificacionTurnos, Long> job = solverManager.solve(calendarioId, problema);
            PlanificacionTurnos solucion = job.getFinalBestSolution();

            // (Opcional) Explicación del score (API nueva)
            try {
                var explanation = solutionManager.explain(solucion);
                System.out.println("[Timefold] Score: " + solucion.getScore());
                System.out.println("[Timefold] Explicación: " + explanation);
            } catch (Exception ignore) { /* diagnóstico opcional */ }

            // 7) Persistir si es factible
            HardSoftScore score = solucion.getScore();
            if (score != null && score.isFeasible()) {
                asignacionRepository.saveAll(solucion.getAsignaciones());
                calendario.setEstado(EstadoCalendario.RESUELTO);
                calendarioRepository.save(calendario);
            } else {
                throw new RuntimeException("No se encontró solución viable (score=" + score + "). Revisa reglas/datos.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al resolver los turnos para calendario " + calendarioId, e);
        }
    }
}
