package cl.investigaciones.turnos.common.utils;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;

import java.util.List;

public final class JerarquiaUtils {

    /* Orden oficial de los grados (sin OPP) */
    private static final List<String> GRADOS = List.of(
            "PFT","SPF","COM","SBC","ISP","SBI","DTV","APS","AP","APP"
    );

    /** Devuelve un entero: cuanto **menor**, más alto en jerarquía. */
    public static int valorJerarquico(FuncionarioAporte f) {
        if (f == null) return Integer.MAX_VALUE;

        String gradoRaw = (f.getGrado() == null ? "" : f.getGrado().trim().toUpperCase());
        boolean opp = gradoRaw.contains("(OPP)");
        String gradoBase = gradoRaw.replace(" (OPP)", "");

        int posGrado = GRADOS.indexOf(gradoBase);
        if (posGrado < 0) posGrado = GRADOS.size();         // grado desconocido → al final

        int antig = f.getAntiguedad() == null ? 9_999 : f.getAntiguedad();

        /*
         * Se multiplica por 10 000 para que “grado” pese más que antigüedad.
         * Se suma 5 000 si es (OPP) para que quede justo después de su par sin OPP.
         */
        return (posGrado * 10_000) + (opp ? 5_000 : 0) + antig;
    }

    /** true si a es **más antiguo** que b según las reglas de negocio. */
    public static boolean esMasAntiguo(FuncionarioAporte a, FuncionarioAporte b) {
        return valorJerarquico(a) < valorJerarquico(b);
    }
}

