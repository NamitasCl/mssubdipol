package cl.investigaciones.turnos.scheduling.restriction.impl;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import cl.investigaciones.turnos.scheduling.restriction.Restriction;
import cl.investigaciones.turnos.scheduling.restriction.util.SeniorityUtil;
import java.util.List;
import java.util.Map;

/**
 * Garantiza que el Jefe de Servicio sea el más antiguo entre los asignados al día.
 * Se comprueba al intentar asignar un Jefe (rol DAY con flag chief=true).
 */
public class SeniorityRestriction implements Restriction {
    @Override
    public boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, List<ShiftSlot>> current) {
        if (!slot.isChief()) return true;
        // obtiene ya asignados ese mismo día
        List<ShiftSlot> sameDay = current.values().stream()
                .flatMap(List::stream)
                .filter(s -> s.getDate().equals(slot.getDate()))
                .toList();
        return sameDay.stream()
                .map(ShiftSlot::getStaffId)
                .map(SeniorityUtil::cargoOf) // consulta microservicio personal si es necesario
                .allMatch(c -> SeniorityUtil.esMasAntiguo(staffId, c));
    }
    @Override public String code() { return "SENIORITY_CHIEF"; }
}