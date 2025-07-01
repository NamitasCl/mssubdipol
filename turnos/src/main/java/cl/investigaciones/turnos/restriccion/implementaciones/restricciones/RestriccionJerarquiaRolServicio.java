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

        RolServicio rol = slot.getRolRequerido();

        /* 1) Su grado ¿habilita el rol? */
        if (!ctx.gradoPuedeEjercerRol(rol, f.getGrado())) return false;

        /* 2) Lógica según el rol que se está cubriendo */
        switch (rol) {

            /* ------------------------------------------------------- */
            /*  JEFE DE SERVICIO: debe ser el más antiguo del DÍA      */
            /* ------------------------------------------------------- */
            case JEFE_DE_SERVICIO -> {
                FuncionarioAporte masAntiguoDelDia = ctx.getFuncionarios().stream()
                        .filter(g -> ctx.gradoPuedeEjercerRol(rol, g.getGrado()))
                        .min(Comparator.comparingInt(JerarquiaUtils::valorJerarquico))
                        .orElse(null);
                return masAntiguoDelDia != null && masAntiguoDelDia.getId().equals(f.getId());
            }

            /* ------------------------------------------------------- */
            /*  ENCARGADOS: más antiguos que sus Ayudantes             */
            /* ------------------------------------------------------- */
            case ENCARGADO_DE_GUARDIA, JEFE_DE_MAQUINA, JEFE_DE_RONDA -> {
                // Si ya hay ayudantes asignados en ese servicio/día, debo ser >= que ellos
                for (Map.Entry<Long, Map<LocalDate, String>> e : ctx.getTurnosPorFechaPorFuncionario().entrySet()) {
                    Long idAyudante = e.getKey();
                    Map<LocalDate, String> porFecha = e.getValue();
                    if (idAyudante.equals(f.getId())) continue;
                    if (!porFecha.containsKey(slot.getFecha())) continue;

                    String nombreTurno = porFecha.get(slot.getFecha());
                    if (nombreTurno == null) continue;

                    boolean esAyudante = nombreTurno.toLowerCase().contains("ayudante")
                            || nombreTurno.toLowerCase().contains("tripulante");

                    if (esAyudante) {
                        FuncionarioAporte ayud = ctx.getFuncionarios().stream()
                                .filter(xx -> xx.getId().equals(idAyudante))
                                .findFirst().orElse(null);
                        if (ayud != null && !JerarquiaUtils.esMasAntiguo(f, ayud))
                            return false;                    // No es más antiguo → no lo acepta
                    }
                }
                return true;    // Cumple condición de encargado
            }

            /* ------------------------------------------------------- */
            /*  AYUDANTES / TRIPULANTES: no pueden superar al encargado */
            /* ------------------------------------------------------- */
            default -> {
                // Detectar cuál es su encargado para ese servicio y día
                FuncionarioAporte encargado = buscarEncargadoAsignado(slot, ctx);
                if (encargado == null) return false; // no se asigna ayudante antes del encargado
                // Ayudante debe ser menos antiguo
                return !JerarquiaUtils.esMasAntiguo(f, encargado);
            }
        }
    }

    private FuncionarioAporte buscarEncargadoAsignado(Slot slot, ContextoAsignacion ctx) {
        LocalDate fecha = slot.getFecha();
        String  servicio = slot.getNombreServicio();

        for (FuncionarioAporte cand : ctx.getFuncionarios()) {
            Map<LocalDate, String> m = ctx.getTurnosPorFechaPorFuncionario().get(cand.getId());
            if (m == null) continue;
            String turno = m.get(fecha);
            if (turno == null) continue;

            boolean esEnc = turno.toLowerCase().contains("encargado") || turno.toLowerCase().contains("jefe");
            if (esEnc && ctx.yaAsignadoAlServicio(cand.getId(), fecha, servicio))
                return cand;
        }
        return null;
    }
}

