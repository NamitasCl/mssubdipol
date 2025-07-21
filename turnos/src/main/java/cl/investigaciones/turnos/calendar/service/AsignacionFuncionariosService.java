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
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
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
        System.out.println("IdCalendario: " + idCalendario);
        List<FuncionarioAporte> funcionarios = funcionarioAporteRepository.findByIdCalendarioAndDisponibleTrue(idCalendario);
        System.out.println("Cantidad de funcionarios obtenidos: " +  funcionarios.size());

        List<Slot> slots = slotService.getSlotsByCalendar(idCalendario);
        System.out.println("Slots obtenidos: " +  slots.size());

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

        for (int i = 0; i <= 40; i++) {
            System.out.println("Funcionario " + i + ": " + funcionarios.get(i).getGrado() + " || Antiguedad: " + funcionarios.get(i).getAntiguedad());
        }

        // Aleatoriza el orden de funcionarios para repartir justo
        /*Collections.shuffle(funcionarios);*/

        // --- 1. Prepara el contexto con días no disponibles ---
        Map<Integer, Set<LocalDate>> diasNoDisponibles = new HashMap<>();
        for (FuncionarioAporte f : funcionarios) {
            if (f.getDiasNoDisponibles() != null) {
                Set<LocalDate> fechas = f.getDiasNoDisponibles().stream()
                        .map(FuncionarioAportadoDiasNoDisponible::getFecha)
                        .collect(Collectors.toSet());
                diasNoDisponibles.put(f.getIdFuncionario(), fechas);
            }
        }

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

        // Configuro el contexto de asignación
        ctx.setDiasNoDisponibles(diasNoDisponibles);
        ctx.setFuncionarios(funcionarios);

        // Ordena los slots para que primero se asignen los encargados, después los ayudantes.
        slots.sort(Comparator.comparingInt(slot -> {
            int idx = ROLES.indexOf(slot.getRolRequerido());
            // Si el rol no está en la lista, lo manda al final
            return idx == -1 ? Integer.MAX_VALUE : idx;
        }));

        // Comienzo la asignación de funcionarios a los slots
        for(int i = 1; i <=2; i++) {
            for (Slot slot : slots ) {

                //Obtengo el rol que necesito llenar
                RolServicio rol = slot.getRolRequerido();

                //Obtengo los grados que pueden ejercer el rol
                Set<String> gradosRol = ctx.getRolesGrado().get(rol);

                //Filtro los funcionarios que pueden cumplir ese rol
                List<FuncionarioAporte> funcionariosFiltrados = funcionarios.stream()
                        .filter(f -> gradosRol.contains(f.getGrado()))
                        .toList();

                for (FuncionarioAporte f : funcionariosFiltrados) {
                    boolean puede = restricciones.stream()
                            .allMatch(r -> r.puedeAsignar(
                                    f,
                                    slot,
                                    ctx
                            ));
                    if (puede) {
                        ctx.agregarAsignacion(
                                f,
                                slot
                        );
                        slot.setCubierto(true);
                        slot.setGradoFuncionario(f.getGrado());
                        slot.setNombreFuncionario(f.getNombreCompleto());
                        slot.setIdFuncionario(f.getIdFuncionario());
                        slot.setAntiguedadFuncionario(f.getAntiguedad());
                        slot.setSiglasUnidadFuncionario(f.getSiglasUnidad());

                        // --- Dejo como no disponible el día asignado al funcionario para futuros calendarios en el mismo mes de la misma unidad ---
                        FuncionarioAportadoDiasNoDisponible bloqueo = new FuncionarioAportadoDiasNoDisponible();
                        bloqueo.setFuncionarioAporte(f);
                        bloqueo.setFecha(slot.getFecha());
                        bloqueo.setMotivo("ASIGNADO_TURNO"); // O el motivo que quieras, según el contexto (puedes personalizarlo)
                        bloqueo.setDetalle("slotId:" + slot.getId());
                        noDisponibleRepository.save(bloqueo);
                        // ---------------------------------------------------------------

                        break;
                    }
                }

            }
        }
        return slots;

    }


}
