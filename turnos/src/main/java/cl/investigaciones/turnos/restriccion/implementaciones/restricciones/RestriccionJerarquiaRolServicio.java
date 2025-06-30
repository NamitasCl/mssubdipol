package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.util.Comparator;
import java.util.List;

public class RestriccionJerarquiaRolServicio implements Restriccion {

    @Override
    public boolean puedeAsignar(FuncionarioAporte funcionario, Slot slot, ContextoAsignacion contexto) {
        RolServicio rol = slot.getRolRequerido(); // Usamos RolServicio enum
        String gradoFuncionario = funcionario.getGrado();

        // 1. ¿El grado puede ejercer ese rol?
        if (!contexto.gradoPuedeEjercerRol(rol, gradoFuncionario)) {
            return false;
        }

        // 2. De la lista de disponibles, filtra solo los que pueden ejercer el rol
        List<FuncionarioAporte> aptos = contexto.getFuncionarios().stream()
                .filter(f -> contexto.gradoPuedeEjercerRol(rol, f.getGrado()))
                .toList();

        // 3. Busca el más antiguo entre ellos
        FuncionarioAporte masAntiguo = aptos.stream()
                .min(Comparator.comparingInt(FuncionarioAporte::getAntiguedad))
                .orElse(null);

        // 4. Solo el más antiguo puede ser asignado
        return masAntiguo != null && masAntiguo.getId().equals(funcionario.getId());
    }
}
