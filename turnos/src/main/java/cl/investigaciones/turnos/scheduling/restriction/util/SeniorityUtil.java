package cl.investigaciones.turnos.scheduling.restriction.util;

import cl.investigaciones.turnos.scheduling.domain.cargo.Cargo;

/**
 * Utilidades estáticas para consultar y comparar antigüedad.
 * 👉 **Debes reemplazar el cuerpo de cargoOf()** por la llamada real
 *    a tu microservicio "personal" cuando lo integres.
 */
public class SeniorityUtil {

    /**
     * Devuelve el Cargo del funcionario consultando (en el futuro) al microservicio Personal.
     * De momento asigna un cargo ficticio en base al id.
     */
    public static Cargo cargoOf(Long staffId) {
        Cargo[] values = Cargo.values();
        return values[(int) (Math.abs(staffId) % values.length)];
    }

    /**
     * ¿El staffId es más antiguo que el otro cargo?
     */
    public static boolean esMasAntiguo(Long staffId, Cargo otroCargo) {
        Cargo c1 = cargoOf(staffId);
        return c1.esMasAntiguoQue(otroCargo);
    }
}