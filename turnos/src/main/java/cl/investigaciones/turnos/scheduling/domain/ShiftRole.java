package cl.investigaciones.turnos.scheduling.domain;

public enum ShiftRole {
    DAY,    // Turno diurno
    NIGHT;  // Turno nocturno

    public boolean isNight() {
        return this == NIGHT;
    }

    public boolean isDay() {
        return this == DAY;
    }
}
