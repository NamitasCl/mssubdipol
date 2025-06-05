package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionSeparacionMinimaTurnos implements RestriccionTurno {
    private final int diasMinimos;

    public RestriccionSeparacionMinimaTurnos(int diasMinimos) {
        this.diasMinimos = diasMinimos;
    }

    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        Integer ultimoDia = contexto.ultimoDiaAsignado(funcionario.getIdFuncionario());
        if (ultimoDia == null) return true;
        return Math.abs(dia - ultimoDia) >= diasMinimos;
    }

    @Override
    public String getNombre() { return "separacion_minima_turnos"; }
}