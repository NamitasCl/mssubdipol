package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.ContextoRestriccion;
import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;

public class RestriccionAntiguedadMinima implements RestriccionTurno {
    private int minima;

    public RestriccionAntiguedadMinima(int minima) { this.minima = minima; }
    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        return funcionario.getAntiguedad() >= minima;
    }
    @Override
    public String getNombre() { return "antiguedad_minima_" + minima; }
}

