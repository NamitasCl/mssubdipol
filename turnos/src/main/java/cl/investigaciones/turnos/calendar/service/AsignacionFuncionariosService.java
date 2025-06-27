package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AsignacionFuncionariosService {

    private final FuncionarioAporteService funcionarioAporteService;
    private final SlotService slotService;


    public AsignacionFuncionariosService(
            FuncionarioAporteService funcionarioAporteService,
            SlotService slotService
    ) {
        this.funcionarioAporteService = funcionarioAporteService;
        this.slotService = slotService;
    }

    @Transactional
    public List<Slot> asignarFuncionarios(Long idCalendario) {
        List<FuncionarioAporteResponseDTO> funcionarios = funcionarioAporteService.listarPorCalendario(idCalendario);
        List<Slot> slots = slotService.getSlotsByCalendar(idCalendario);

        //Aleatorizamos los funcionarios:
        Collections.shuffle(funcionarios);

        for (int i = 0; i < slots.size(); i++) {
            slots.get(i).setIdFuncionarioAsignado(funcionarios.get(i % funcionarios.size()).getId());
        }
        return slots;
    }


}
