package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAportadoDiasNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
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
    private final SlotService slotService;


    public AsignacionFuncionariosService(
            FuncionarioAporteRepository funcionarioAporteService,
            SlotService slotService,
            FuncionarioAportadoDiasNoDisponibleRepository noDisponibleRepository
    ) {
        this.funcionarioAporteRepository = funcionarioAporteService;
        this.slotService = slotService;
        this.noDisponibleRepository = noDisponibleRepository;
    }

    @Transactional
    public List<Slot> asignarFuncionarios(
            Long idCalendario,
            List<Restriccion> restricciones
    ) {
        // Recupera funcionarios designados y slots del calendario
        List<FuncionarioAporte> funcionarios = funcionarioAporteRepository.findByIdCalendarioAndDisponibleTrue(idCalendario);
        List<Slot> slots = slotService.getSlotsByCalendar(idCalendario);

        // Aleatoriza el orden de funcionarios para repartir justo
        Collections.shuffle(funcionarios);

        // Convierte a DTO para facilitar el manejo
        List<FuncionarioAporteResponseDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioAporteMapper::toDto)
                .collect(Collectors.toList());

        // --- 1. Prepara el contexto con días no disponibles ---
        Map<Long, Set<LocalDate>> diasNoDisponibles = new HashMap<>();
        for (FuncionarioAporteResponseDTO f : funcionariosDTO) {
            if (f.getDiasNoDisponibles() != null) {
                Set<LocalDate> fechas = f.getDiasNoDisponibles().stream()
                        .map(DiaNoDisponibleDTO::getFecha)
                        .collect(Collectors.toSet());
                diasNoDisponibles.put(f.getId(), fechas);
            }
        }

        ContextoAsignacion contexto = new ContextoAsignacion();
        contexto.setDiasNoDisponibles(diasNoDisponibles);

        // --- 2. Asigna funcionarios a slots respetando restricciones ---
        for (Slot slot : slots) {
            boolean asignado = false;
            for (FuncionarioAporteResponseDTO funcionario : funcionariosDTO) {
                boolean puede = restricciones.stream()
                        .allMatch(r -> r.puedeAsignar(funcionario, slot, contexto));
                if (puede) {
                    slot.setIdFuncionarioAsignado(funcionario.getId());
                    // Agrega asignación en contexto
                    contexto.agregarAsignacion(funcionario.getId(), slot.getFecha(), slot.getNombreServicio());
                    asignado = true;
                    break; // slot cubierto
                }
            }
            if (!asignado) {
                // Si no se pudo asignar, puedes dejarlo en null o -1, según tu modelo
                slot.setIdFuncionarioAsignado(null);
            }
        }

        // Si necesitas guardar los slots asignados, puedes hacerlo aquí
        //slotService.saveAll(slots);

        return slots; // Devuelve la lista con los funcionarios ya asignados
    }


}
