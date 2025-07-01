package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.common.utils.JerarquiaUtils;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class RestriccionJerarquiaRolServicio implements Restriccion {

    @Override
    public boolean puedeAsignar(FuncionarioAporte f, Slot slot, ContextoAsignacion ctx) {




        return false;
    }

}

