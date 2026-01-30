package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.SlotUpdateDTO;
import cl.investigaciones.turnos.calendar.dto.SlotsResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.SlotMapper;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.plantilla.domain.TipoServicio;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SlotService {

    private final SlotRepository slotRepository;

    public SlotService(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    @Transactional
    public List<Slot> swapSlots(Long slotIdA, Long slotIdB) {
        Slot a = slotRepository.findById(slotIdA).orElseThrow(() -> new RuntimeException("Slot no encontrado con id: " + slotIdA));
        Slot b = slotRepository.findById(slotIdB).orElseThrow(() -> new RuntimeException("Slot no encontrado con id: " + slotIdB));

        // Validar que el rol requerido sea el mismo
        if (a.getRolRequerido() == null || b.getRolRequerido() == null || !a.getRolRequerido().equals(b.getRolRequerido())) {
            throw new RuntimeException("No se puede intercambiar: los slots no tienen el mismo rol requerido");
        }

        // Intercambiar los datos del funcionario entre los slots
        Integer idFuncA = a.getIdFuncionario();
        String nombreFuncA = a.getNombreFuncionario();
        String gradoFuncA = a.getGradoFuncionario();
        String siglasUnidadFuncA = a.getSiglasUnidadFuncionario();
        Boolean cubiertoA = a.isCubierto();

        a.setIdFuncionario(b.getIdFuncionario());
        a.setNombreFuncionario(b.getNombreFuncionario());
        a.setGradoFuncionario(b.getGradoFuncionario());
        a.setSiglasUnidadFuncionario(b.getSiglasUnidadFuncionario());
        a.setCubierto(b.isCubierto());

        b.setIdFuncionario(idFuncA);
        b.setNombreFuncionario(nombreFuncA);
        b.setGradoFuncionario(gradoFuncA);
        b.setSiglasUnidadFuncionario(siglasUnidadFuncA);
        b.setCubierto(cubiertoA);

        return slotRepository.saveAll(List.of(a, b));
    }

    public int getCantidadTotalSlotsByCalendar(Long calendarId) {
        return slotRepository.countSlotByIdCalendario(calendarId);
    }

    public List<Slot> getSlotsByCalendar(Long calendarId) {
        return slotRepository.findAllByIdCalendario(calendarId);
    }

    public List<SlotsResponseDTO> getSlotsResponseByCalendar(Long calendarId) {
        return slotRepository.findAllByIdCalendario(calendarId).stream()
                .map(SlotMapper::toDTO)
                .toList();
    }


    public void saveAll(List<Slot> slots) {
        slotRepository.saveAll(slots);
    }

    @Transactional
    public Slot updateSlot(Long id, SlotUpdateDTO slotUpdateDTO) {
        Optional<Slot> optionalSlot = slotRepository.findById(id);

        if (optionalSlot.isEmpty()) {
            throw new RuntimeException("Slot no encontrado con id: " + id);
        }

        Slot slot = optionalSlot.get();

        // Actualizar solo los campos que no son nulos
        if (slotUpdateDTO.getFecha() != null) {
            slot.setFecha(slotUpdateDTO.getFecha());
        }
        if (slotUpdateDTO.getIdFuncionario() != null) {
            slot.setIdFuncionario(slotUpdateDTO.getIdFuncionario());
        }
        if (slotUpdateDTO.getNombreFuncionario() != null) {
            slot.setNombreFuncionario(slotUpdateDTO.getNombreFuncionario());
        }
        if (slotUpdateDTO.getGradoFuncionario() != null) {
            slot.setGradoFuncionario(slotUpdateDTO.getGradoFuncionario());
        }
        if (slotUpdateDTO.getSiglasUnidadFuncionario() != null) {
            slot.setSiglasUnidadFuncionario(slotUpdateDTO.getSiglasUnidadFuncionario());
        }
        if (slotUpdateDTO.getCubierto() != null) {
            slot.setCubierto(slotUpdateDTO.getCubierto());
        }


        return slotRepository.save(slot);
    }

    @Transactional
    public List<Slot> updateSlots(List<SlotUpdateDTO> slotsUpdate) {
        return slotsUpdate.stream()
                .map(slotDTO -> updateSlot(slotDTO.getId(), slotDTO))
                .collect(Collectors.toList());
    }

    public List<Slot> getFuncionariosByUnidadAndTipoServicio(String siglasUnidad, TipoServicio tipoServicio) {
        // Este método podría necesitar una consulta más específica
        // dependiendo de cómo quieras filtrar los funcionarios por unidad
        return slotRepository.findAllBySiglasUnidadFuncionarioAndTipoServicio(siglasUnidad, tipoServicio);
    }

    /**
     * Obtiene todos los turnos asignados a un funcionario.
     */
    public List<SlotsResponseDTO> getMisTurnos(Integer idFuncionario) {
        return slotRepository.findAllByIdFuncionarioOrderByFechaAsc(idFuncionario)
                .stream()
                .map(SlotMapper::toDTO)
                .toList();
    }

    /**
     * Obtiene turnos de un funcionario filtrados por mes y año.
     */
    public List<SlotsResponseDTO> getMisTurnosByMesAnio(Integer idFuncionario, int mes, int anio) {
        return slotRepository.findByFuncionarioAndMesAnio(idFuncionario, mes, anio)
                .stream()
                .map(SlotMapper::toDTO)
                .toList();
    }

}

