package cl.investigaciones.turnos.calendar.utils;

import java.time.LocalDate;

public interface FeriadoService {
    public boolean esFeriado(LocalDate fecha);
}
