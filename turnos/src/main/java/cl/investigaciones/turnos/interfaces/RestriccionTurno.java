package cl.investigaciones.turnos.interfaces;

import cl.investigaciones.turnos.model.AsignacionFuncionario;

public interface RestriccionTurno {
    boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto);
    String getNombre();
}
