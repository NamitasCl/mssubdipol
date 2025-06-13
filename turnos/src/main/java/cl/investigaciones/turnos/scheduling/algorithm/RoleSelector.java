package cl.investigaciones.turnos.scheduling.algorithm;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import java.util.List;

public class RoleSelector {
    /**
     * Ordena lista de candidatos por antigüedad y devuelve el primero.
     */
    public static Long selectChief(List<Long> candidates) {
        return candidates.get(0); // ya vienen ordenados por antigüedad
    }
}