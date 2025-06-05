package cl.investigaciones.turnos.utils;

import cl.investigaciones.turnos.enums.Grado;
import cl.investigaciones.turnos.model.AsignacionFuncionario;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

public class FuncionarioUtils {

    public static List<AsignacionFuncionario> ordenarPorGradoYAntiguedad(List<AsignacionFuncionario> funcionarios) {
        return funcionarios.stream()
                .sorted(comparadorGradoYAntiguedad())
                .toList()   ;
    }

    public static Comparator<AsignacionFuncionario> comparadorGradoYAntiguedad() {
        return (a, b) -> {
            /*
            *   Si el valor es negativo, el primer elemento es "menor" (más alto en jerarquía en este contexto).

                Si el valor es cero, ambos elementos son iguales en ese criterio.

                Si el valor es positivo, el primero es "mayor" (más bajo en jerarquía).

            * */
            int comparador = gradoIndex(a.getSiglasCargo()) - gradoIndex(b.getSiglasCargo());
            if (comparador != 0) return comparador;
            return Integer.compare(a.getAntiguedad(), b.getAntiguedad());

        };
    }

    public static int gradoIndex(String siglas) {
        if (siglas == null) return Grado.values().length;
        String key = siglas.trim().toUpperCase().replace(" (OPP)", "_OPP").replace(" (AC)", "_AC");
        try {
            return Grado.valueOf(key).ordinal();
        } catch (Exception e) {
            return Grado.values().length; // Si no existe, lo manda al final
        }
    }

    List<AsignacionFuncionario> funcionarioFiltradosPorGrado(List<AsignacionFuncionario> funcionarios, Set<Grado> gradosPermitidos) {
        /*
        *    Modo de uso:
        *    Set<Grado> permitidos = EnumSet.of(Grado.COM, Grado.COM_OPP, Grado.SPF);
        *    List<AsignacionFuncionario> filtrados = funcionarioFiltradosPorGrado(funcionarios, permitidos);
        *
        * */
            return funcionarios.stream()
                    .filter(f -> {
                        try {
                            Grado grado = Grado.parseGrado(f.getSiglasCargo());
                            return gradosPermitidos.contains(grado);
                        } catch (Exception e) {
                            return false;
                        }
            })
            .toList();
    }


}
