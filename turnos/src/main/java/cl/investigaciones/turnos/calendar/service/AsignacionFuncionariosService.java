package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalResponse;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAportadoDiasNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import cl.investigaciones.turnos.common.RestriccionFactory;
import cl.investigaciones.turnos.common.utils.JerarquiaUtils;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AsignacionFuncionariosService {

    private final FuncionarioAporteRepository funcionarioAporteRepository;
    private final FuncionarioAportadoDiasNoDisponibleRepository noDisponibleRepository;
    private final CalendarioRepository calendarioRepository;
    private final SlotService slotService;
    private final FuncionarioDiaNoDisponibleService diaNoDisponibleGlobalService;

    private final List<RolServicio> ROLES = List.of(
            RolServicio.JEFE_DE_RONDA,
            RolServicio.JEFE_DE_SERVICIO,
            RolServicio.ENCARGADO_DE_GUARDIA,
            RolServicio.JEFE_DE_MAQUINA,
            RolServicio.AYUDANTE_DE_GUARDIA,
            RolServicio.TRIPULANTE
    );


    public AsignacionFuncionariosService(
            FuncionarioAporteRepository funcionarioAporteService,
            SlotService slotService,
            FuncionarioAportadoDiasNoDisponibleRepository noDisponibleRepository,
            CalendarioRepository calendarioRepository,
            FuncionarioDiaNoDisponibleService funcionarioDiaNoDisponibleService
    ) {
        this.funcionarioAporteRepository = funcionarioAporteService;
        this.slotService = slotService;
        this.noDisponibleRepository = noDisponibleRepository;
        this.calendarioRepository = calendarioRepository;
        this.diaNoDisponibleGlobalService = funcionarioDiaNoDisponibleService;
    }

    @Transactional
    public List<Slot> asignarFuncionarios(Long idCalendario) throws JsonProcessingException {

        // Recupera funcionarios designados y slots del calendario
        log.info("IdCalendario: {}", idCalendario);
        List<FuncionarioAporte> funcionarios = funcionarioAporteRepository.findByIdCalendarioAndDisponibleTrue(idCalendario);
        log.info("Cantidad de funcionarios obtenidos: {}", funcionarios.size());

        List<Slot> slots = slotService.getSlotsByCalendar(idCalendario);
        log.info("Slots obtenidos: {}", slots.size());

        Calendario calendario = calendarioRepository.findById(idCalendario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado"));

        // Cargo la configuracion del calendario
        ConfiguracionRestriccionesCalendario config = calendario.getConfiguracionRestricciones();

        // Se construye la lista de restricciones en forma dinámica
        ObjectMapper objectMapper = new ObjectMapper();
        String restriccionesConfig = objectMapper.writeValueAsString(config.getParametrosJson());
        List<Restriccion> restricciones = RestriccionFactory.fromJsonConfig(restriccionesConfig);

        // Prepara el contexto de asignación
        ContextoAsignacion ctx = new ContextoAsignacion();

        // Ordenar por jerarquía: primero los más altos en la escala
        funcionarios.sort(Comparator.comparingInt(JerarquiaUtils::valorJerarquico));

        for (int i = 0; i < Math.min(funcionarios.size(), 40); i++) {
            log.debug("Funcionario {}: {} || Antiguedad: {}", i, funcionarios.get(i).getGrado(), funcionarios.get(i).getAntiguedad());
        }

        // Aleatoriza el orden de funcionarios para repartir justo
        /*Collections.shuffle(funcionarios);*/
        // Aleatoriza el orden de funcionarios para repartir justo
        /*Collections.shuffle(funcionarios);*/
        log.debug("Pasando A");
        // --- 1. Prepara el contexto con días no disponibles ---
        Map<Integer, Set<LocalDate>> diasNoDisponibles = new HashMap<>();
        Map<Integer, Set<LocalDate>> diasNoDisponiblesPorAsignacion = new HashMap<>();

        for (FuncionarioAporte f : funcionarios) {
            if (f.getDiasNoDisponibles() != null) {
                Set<LocalDate> fechas = f.getDiasNoDisponibles().stream()
                        .map(FuncionarioAportadoDiasNoDisponible::getFecha)
                        .collect(Collectors.toSet());
                diasNoDisponibles.put(f.getIdFuncionario(), fechas);
            }
        }
        log.debug("Pasando B");
        // Cargo los dias no disponibles por citacion o actividad del funcionario
        for (FuncionarioAporte f : funcionarios) {
            DiaNoDisponibleGlobalResponse globalResponse = diaNoDisponibleGlobalService.findByIdFuncionario(f.getIdFuncionario());
            if (globalResponse != null && globalResponse.getDias() != null) {
                Set<LocalDate> fechasGlobales = globalResponse.getDias()
                        .stream()
                        .map(DiaNoDisponibleGlobalDTO::getFecha)
                        .collect(Collectors.toSet());

                diasNoDisponibles
                        .computeIfAbsent(f.getIdFuncionario(), k -> new HashSet<>())
                        .addAll(fechasGlobales);
            }
        }
        log.debug("Pasando C");
        for (FuncionarioAporte f : funcionarios) {
            try {
                DiaNoDisponibleGlobalResponse globalResponse = diaNoDisponibleGlobalService.findByIdFuncionarioDiaNoDisponible(f);
                if (globalResponse != null && globalResponse.getDias() != null) {
                    Set<LocalDate> fechasGlobales = globalResponse.getDias()
                            .stream()
                            .map(DiaNoDisponibleGlobalDTO::getFecha)
                            .collect(Collectors.toSet());

                    diasNoDisponiblesPorAsignacion
                            .computeIfAbsent(f.getIdFuncionario(), k -> new HashSet<>())
                            .addAll(fechasGlobales);
                }
            } catch (Exception e) {
                log.error("Error al obtener días no disponibles para funcionario ID " + f.getIdFuncionario(), e);
            }
        }

        log.debug("Pasamos!");

        // Configuro el contexto de asignación
        ctx.setDiasNoDisponibles(diasNoDisponibles);
        ctx.setFuncionarios(funcionarios);

        // Ordena los slots para que primero se asignen los encargados, después los ayudantes.
        slots.sort(Comparator.comparingInt(slot -> {
            int idx = ROLES.indexOf(slot.getRolRequerido());
            // Si el rol no está en la lista, lo manda al final
            return idx == -1 ? Integer.MAX_VALUE : idx;
        }));

        log.info("Limpiando slots");
        for (Slot slot : slots) {
            slot.setCubierto(false);
            slot.setGradoFuncionario(null);
            slot.setNombreFuncionario(null);
            slot.setIdFuncionario(null);
            slot.setAntiguedadFuncionario(null);
            slot.setSiglasUnidadFuncionario(null);
        }
        log.info("Limpieza terminada.");


        log.info("Iniciando asignación");

        // Limpio los días asignados al calendario por iniciarse una nueva asignación.
        log.info("Eliminando registros de no disponibles por asignacion");
        noDisponibleRepository.deleteAllByCalendarioIdAndMotivo(calendario.getId(), "ASIGNADO_TURNO");
        noDisponibleRepository.flush();
        log.info("Registros eliminados");

        List<FuncionarioAportadoDiasNoDisponible> bloqueosExistentes = noDisponibleRepository.findAllByCalendarioIdAndMotivo(
                calendario.getId(), "ASIGNADO_TURNO"
        );

        log.info("Cantidad de bloqueos existentes: {}", bloqueosExistentes.size());

        // --- OPTIMIZACIÓN: Pre-calcular candidatos por Rol ---
        Map<RolServicio, List<FuncionarioAporte>> mapaCandidatosPorRol = new HashMap<>();
        
        // Iteramos sobre todos los roles posibles definidos en el contexto
        // Si no existe getRolesGrado(), habría que usar los valores del enum RolServicio
        if (ctx.getRolesGrado() != null) {
            for (Map.Entry<RolServicio, Set<String>> entry : ctx.getRolesGrado().entrySet()) {
                RolServicio rol = entry.getKey();
                Set<String> gradosAceptados = entry.getValue();

                List<FuncionarioAporte> matches = funcionarios.stream()
                        .filter(f -> gradosAceptados.contains(f.getGrado()))
                        .sorted(Comparator.comparingInt(JerarquiaUtils::valorJerarquico))
                        .collect(Collectors.toList());
                
                mapaCandidatosPorRol.put(rol, matches);
            }
        }

        // Comienzo la asignación de funcionarios a los slots
        for(int i = 1; i <=2; i++) { // Intentamos 2 pasadas
            for (Slot slot : slots ) {

                if(slot.isCubierto()) {
                    continue;
                }

                //Obtengo el rol que necesito llenar
                RolServicio rol = slot.getRolRequerido();

                // Recuperamos candidatos pre-calculados (O(1)) en lugar de filtrar (O(N))
                List<FuncionarioAporte> funcionariosFiltrados = mapaCandidatosPorRol.getOrDefault(rol, Collections.emptyList());

                for (FuncionarioAporte f : funcionariosFiltrados) {
                    boolean puede = restricciones.stream()
                            .allMatch(r -> r.puedeAsignar(
                                    f,
                                    slot,
                                    ctx
                            ));
                    if (puede) {
                        ctx.actualizarContexto(
                                f,
                                slot
                        );
                        slot.setCubierto(true);
                        slot.setGradoFuncionario(f.getGrado());
                        slot.setNombreFuncionario(f.getNombreCompleto());
                        slot.setIdFuncionario(f.getIdFuncionario());
                        slot.setAntiguedadFuncionario(f.getAntiguedad());
                        slot.setSiglasUnidadFuncionario(f.getSiglasUnidad());

                        FuncionarioAportadoDiasNoDisponible bloqueo = new FuncionarioAportadoDiasNoDisponible();
                        bloqueo.setFuncionarioAporte(f);
                        bloqueo.setFecha(slot.getFecha());
                        bloqueo.setMotivo("ASIGNADO_TURNO");
                        bloqueo.setDetalle("slotId:" + slot.getId());
                        bloqueo.setCalendario(calendario); 
                        noDisponibleRepository.save(bloqueo);

                        break;
                    }
                }

            }
        }

        return slots;

    }


}
