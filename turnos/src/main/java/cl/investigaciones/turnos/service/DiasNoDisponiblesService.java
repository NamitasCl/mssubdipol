package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.repository.FuncionarioDiasNoDisponibleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DiasNoDisponiblesService {

    @Autowired
    private FuncionarioDiasNoDisponibleRepository repo;

    public Map<Integer, List<String>> getDiasNoDisponibles(int mes, int anio) {
        List<FuncionarioDiasNoDisponible> lista = repo.obtenerPorMesYAnio(mes, anio);

        Map<Integer, List<String>> resultado = new HashMap<>();

        for (var dia : lista) {
            Integer idFun = dia.getAsignacionFuncionario().getIdFuncionario();

            List<LocalDate> fechas = new ArrayList<>();

            if (dia.getFecha() != null) {
                fechas.add(dia.getFecha());
            } else if (dia.getFechaInicio() != null && dia.getFechaFin() != null) {
                LocalDate start = dia.getFechaInicio();
                LocalDate end = dia.getFechaFin();

                while (!start.isAfter(end)) {
                    if (start.getMonthValue() == mes && start.getYear() == anio) {
                        fechas.add(start);
                    }
                    start = start.plusDays(1);
                }
            }

            for (LocalDate fecha : fechas) {
                resultado.computeIfAbsent(idFun, k -> new ArrayList<>()).add(fecha.toString());
            }
        }

        return resultado;
    }
}
