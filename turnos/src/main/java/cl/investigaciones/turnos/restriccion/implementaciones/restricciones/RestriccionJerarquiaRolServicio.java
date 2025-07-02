package cl.investigaciones.turnos.restriccion.implementaciones.restricciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.common.utils.JerarquiaUtils;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import cl.investigaciones.turnos.restriccion.implementaciones.ContextoAsignacion;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;

public class RestriccionJerarquiaRolServicio implements Restriccion {

    @Override
    public boolean puedeAsignar(FuncionarioAporte f, Slot slot, ContextoAsignacion ctx) {
        RolServicio rolRequerido = slot.getRolRequerido();

        // Si el rol es encargado, jefe de ronda o jefe de máquina, no hay restricción
        if (rolRequerido.equals(RolServicio.ENCARGADO_DE_GUARDIA) ||
                rolRequerido.equals(RolServicio.JEFE_DE_RONDA) ||
                rolRequerido.equals(RolServicio.JEFE_DE_MAQUINA)) {
            return true;
        }

        // Obtenemos el encargado ya asignado en la misma fecha, servicio y recinto
        String claveEncargado = ctx.claveRolAsignacion(
                slot.getFecha(),
                slot.getNombreServicio(),
                RolServicio.ENCARGADO_DE_GUARDIA
        );
        FuncionarioAporte encargado = ctx.getFuncionarioPorAsignacion().get(claveEncargado);

        if (encargado == null) {
            // Si no hay encargado aún, depende de tu lógica de negocio: true o false
            // Aquí retornamos false (no se puede asignar ayudante antes que encargado)
            return false;
        }

        // Sólo dejamos pasar si f es menos antiguo que el encargado (es decir, su valor jerárquico es mayor)
        // OJO: Si quieres que pueda ser IGUAL en antigüedad, usa <=
        boolean ayudanteEsMasAntiguo = !JerarquiaUtils.esMasAntiguo(f, encargado);
        System.out.println("Encargado: " + encargado.getNombreCompleto());
        System.out.println("Ayudante: " + f.getNombreCompleto());
        System.out.println("Ayudante es más antiguo que encargado: " + ayudanteEsMasAntiguo);
        return ayudanteEsMasAntiguo;
    }
}
