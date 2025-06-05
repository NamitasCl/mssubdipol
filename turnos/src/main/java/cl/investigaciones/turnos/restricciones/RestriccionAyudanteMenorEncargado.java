package cl.investigaciones.turnos.restricciones;

import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.interfaces.ContextoRestriccion;

public class RestriccionAyudanteMenorEncargado implements RestriccionTurno {
    @Override
    public boolean permiteAsignacion(AsignacionFuncionario funcionario, int dia, String nombreTurno, ContextoRestriccion contexto) {
        // El contexto define si hay un encargado más antiguo asignado en ese día
        return contexto.existeEncargadoMasAntiguo(funcionario.getIdFuncionario(), dia);
    }

    @Override
    public String getNombre() { return "ayudante_menor_encargado"; }
}
