package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.interfaces.ContextoRestriccion;
import cl.investigaciones.turnos.model.AsignacionFuncionarioTurno;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;

import java.time.LocalDate;
import java.util.*;

public class ContextoRestriccionAsignacion implements ContextoRestriccion {

    private final Map<Integer, Set<Integer>> diasConTurnoPorFuncionario = new HashMap<>();
    private final Map<Integer, List<Integer>> diasTurnoPorFuncionario = new HashMap<>();
    private final Map<Integer, Set<Integer>> diasNoDisponiblesPorFuncionario = new HashMap<>();
    private final Map<Integer, Map<String, Integer>> turnosPorNombreYMes = new HashMap<>();
    private final int mes;
    private final int anio;

    public ContextoRestriccionAsignacion(
            List<AsignacionFuncionarioTurno> asignacionesPrevias,
            List<FuncionarioDiasNoDisponible> noDisponibles,
            int mes, int anio
    ) {
        this.mes = mes;
        this.anio = anio;

        for (AsignacionFuncionarioTurno a : asignacionesPrevias) {
            int idFun = a.getFuncionario().getIdFuncionario();
            int dia = a.getDiaAsignacion().getDia();

            diasConTurnoPorFuncionario.computeIfAbsent(idFun, k -> new HashSet<>()).add(dia);
            diasTurnoPorFuncionario.computeIfAbsent(idFun, k -> new ArrayList<>()).add(dia);

            // Para turnos por nombre
            turnosPorNombreYMes
                    .computeIfAbsent(idFun, k -> new HashMap<>())
                    .merge(a.getNombreTurno(), 1, Integer::sum);
        }

        for (FuncionarioDiasNoDisponible f : noDisponibles) {
            int idFun = f.getAsignacionFuncionario().getIdFuncionario();
            List<Integer> dias = new ArrayList<>();
            if (f.getFecha() != null && f.getFecha().getMonthValue() == mes && f.getFecha().getYear() == anio) {
                dias.add(f.getFecha().getDayOfMonth());
            }
            if (f.getFechaInicio() != null && f.getFechaFin() != null) {
                LocalDate cursor = f.getFechaInicio();
                while (!cursor.isAfter(f.getFechaFin())) {
                    if (cursor.getMonthValue() == mes && cursor.getYear() == anio)
                        dias.add(cursor.getDayOfMonth());
                    cursor = cursor.plusDays(1);
                }
            }
            diasNoDisponiblesPorFuncionario.computeIfAbsent(idFun, k -> new HashSet<>()).addAll(dias);
        }
    }

    @Override
    public boolean tieneTurno(int idFuncionario, int dia) {
        return diasConTurnoPorFuncionario.getOrDefault(idFuncionario, Set.of()).contains(dia);
    }

    @Override
    public Integer ultimoDiaAsignado(int idFuncionario) {
        List<Integer> dias = diasTurnoPorFuncionario.get(idFuncionario);
        if (dias == null || dias.isEmpty()) return null;
        return Collections.max(dias);
    }

    @Override
    public boolean estaMarcadoNoDisponible(int idFuncionario, int dia) {
        return diasNoDisponiblesPorFuncionario.getOrDefault(idFuncionario, Set.of()).contains(dia);
    }

    @Override
    public boolean existeEncargadoMasAntiguo(int idFuncionario, int dia) {
        // Ejemplo simple: no implementado, customiza si lo necesitas.
        return false;
    }

    @Override
    public int contarTurnosEnRango(int idFuncionario, int diaInicio, int diaFin) {
        List<Integer> dias = diasTurnoPorFuncionario.getOrDefault(idFuncionario, List.of());
        return (int) dias.stream().filter(d -> d >= diaInicio && d <= diaFin).count();
    }

    @Override
    public boolean tieneTurnoCerca(int idFuncionario, int dia, int separacion) {
        List<Integer> dias = diasTurnoPorFuncionario.getOrDefault(idFuncionario, List.of());
        for (int d : dias) {
            if (Math.abs(dia - d) <= separacion) return true;
        }
        return false;
    }

    @Override
    public int contarTurnosFinDeSemana(int idFuncionario) {
        // No implementado, puedes añadir si manejas día de semana
        return 0;
    }

    @Override
    public boolean tieneGradoPermitido(int idFuncionario, String gradoRequerido) {
        // No implementado: depende si tienes grados permitidos cargados
        return true;
    }

    @Override
    public boolean asignadoMismoNombreTurno(int idFuncionario, String nombreTurno, int mes) {
        return turnosPorNombreYMes.getOrDefault(idFuncionario, Map.of()).getOrDefault(nombreTurno, 0) > 0;
    }
}