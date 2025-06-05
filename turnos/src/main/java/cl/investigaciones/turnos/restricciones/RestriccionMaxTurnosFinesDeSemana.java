package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionMaxTurnosFinesDeSemana implements RestriccionTurno {
    private final int maxTurnos;

    public RestriccionMaxTurnosFinesDeSemana(int maxTurnos) {
        this.maxTurnos = maxTurnos;
    }

    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        // Supón que el contexto tiene un método que cuenta los turnos de fin de semana
        return contexto.contarTurnosFinDeSemana(funcionario.getIdFuncionario()) < maxTurnos;
    }

    @Override
    public String getNombre() { return "max_turnos_finde_" + maxTurnos; }
}
