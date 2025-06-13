package cl.investigaciones.turnos.scheduling.restriction;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import java.util.*;

public class RestrictionEngine {

    private final List<Restriction> rules;

    public RestrictionEngine(List<Restriction> rules) {
        this.rules = rules;
    }

    public boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, List<ShiftSlot>> assigned) {
        return rules.stream().allMatch(r -> r.isAllowed(slot, staffId, assigned));
    }
}