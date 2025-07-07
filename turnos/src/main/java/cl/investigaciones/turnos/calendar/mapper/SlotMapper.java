package cl.investigaciones.turnos.calendar.mapper;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.SlotsResponseDTO;

public class SlotMapper {

    public static SlotsResponseDTO toDTO(Slot slot) {
        SlotsResponseDTO dto = new SlotsResponseDTO();
        dto.setId(slot.getId());
        dto.setIdCalendario(slot.getIdCalendario());
        dto.setFecha(slot.getFecha().toString());
        dto.setNombreServicio(slot.getNombreServicio());
        dto.setRolRequerido(slot.getRolRequerido());
        dto.setRecinto(slot.getRecinto());
        dto.setCubierto(slot.isCubierto());
        dto.setIdFuncionario(slot.getIdFuncionario());
        dto.setGradoFuncionario(slot.getGradoFuncionario());
        dto.setNombreFuncionario(slot.getNombreFuncionario());
        dto.setAntiguedadFuncionario(slot.getAntiguedadFuncionario());
        return dto;
    }

}
