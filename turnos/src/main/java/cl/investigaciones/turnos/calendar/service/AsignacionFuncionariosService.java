package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAportadoDiasNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import cl.investigaciones.turnos.common.RestriccionFactory;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;
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


    public AsignacionFuncionariosService(
            FuncionarioAporteRepository funcionarioAporteService,
            SlotService slotService,
            FuncionarioAportadoDiasNoDisponibleRepository noDisponibleRepository,
            CalendarioRepository calendarioRepository
    ) {
        this.funcionarioAporteRepository = funcionarioAporteService;
        this.slotService = slotService;
        this.noDisponibleRepository = noDisponibleRepository;
        this.calendarioRepository = calendarioRepository;
    }

    @Transactional
    public List<Slot> asignarFuncionarios(Long idCalendario) {
        // Recupera funcionarios designados y slots del calendario
        List<FuncionarioAporte> funcionarios = funcionarioAporteRepository.findByIdCalendarioAndDisponibleTrue(idCalendario);
        List<Slot> slots = slotService.getSlotsByCalendar(idCalendario);

        Calendario calendario = calendarioRepository.findById(idCalendario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado"));

        // Cargo la configuracion del calendario
        ConfiguracionRestriccionesCalendario config = calendario.getConfiguracionRestricciones();

        // Se construye la lista de restricciones en forma dinámica
        List<Restriccion> restricciones = RestriccionFactory.fromJsonConfig(config.getParametrosJson());

        // Aleatoriza el orden de funcionarios para repartir justo
        Collections.shuffle(funcionarios);

        System.out.println("Funcionarios obtenidos: " + funcionarios.size());

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

        ContextoAsignacion ctx = new ContextoAsignacion();
        ctx.setDiasNoDisponibles(diasNoDisponibles);
        ctx.setFuncionarios(funcionarios);

        // Ordena los slots para que primero se asignen los encargados, después los ayudantes.
        slots.sort(Comparator.comparingInt(slot -> {
            RolServicio rol = slot.getRolRequerido();
            // ENCARGADO primero, luego ayudante, luego otros
            if (rol == RolServicio.ENCARGADO_DE_GUARDIA) return 0;
            if (rol == RolServicio.AYUDANTE_DE_GUARDIA) return 1;
            return 2;
        }));

        for(int i = 1; i <=2; i++) {
            for (Slot slot : slots ) {
                System.out.println("Entrando a slot de fecha: " + slot.getFecha().toString());
                System.out.println("Slot para " + slot.getRolRequerido());

                //Obtengo el rol que necesito llenar
                RolServicio rol = slot.getRolRequerido();

                //Obtengo los grados que pueden ejercer el rol
                Set<String> gradosRol = ctx.getRolesGrado().get(rol);

                //Filtro los funcionarios que pueden cumplir ese rol
                List<FuncionarioAporte> funcionariosFiltrados = funcionarios.stream()
                        .filter(f -> gradosRol.contains(f.getGrado()))
                        .toList();

                System.out.println("Funcionarios filtrados: " + funcionariosFiltrados.size());


                for (FuncionarioAporte f : funcionariosFiltrados) {
                    boolean puede = restricciones.stream().peek(restriccion -> System.out.println("Funcionario: " + f.getNombreCompleto() + " | " + "Antiguedad: " + f.getAntiguedad()))
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
