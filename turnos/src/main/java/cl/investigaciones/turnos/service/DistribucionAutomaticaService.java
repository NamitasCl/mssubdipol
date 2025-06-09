package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.enums.Grado;
import cl.investigaciones.turnos.interfaces.RestriccionTurno;
import cl.investigaciones.turnos.model.*;
import cl.investigaciones.turnos.repository.*;
import cl.investigaciones.turnos.restricciones.RestriccionAsignacionDiasNoDisponible;
import cl.investigaciones.turnos.restricciones.RestriccionDiasConsecutivos;
import cl.investigaciones.turnos.restricciones.RestriccionRepeticionDiaFuncionario;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DistribucionAutomaticaService {

    @Autowired
    private AsignacionFuncionarioRepository funcionarioRepo;
    @Autowired
    private TurnoAsignacionRepository turnoAsignacionRepo;
    @Autowired
    private DiaAsignacionRepository diaAsignacionRepo;
    @Autowired
    private AsignacionFuncionarioTurnoRepository asignacionTurnoRepo;
    @Autowired
    private FuncionarioDiasNoDisponibleRepository noDisponibleRepo;
    @Autowired
    private ServicioDiarioRepository servicioDiarioRepo;

    // Orden real de los grados de mayor a menor antigüedad (ajusta a tu institución)
    private static final List<String> ORDEN_GRADOS = List.of(
            "SBC", "COM", "SPF", "SOP", "CPL", "DTE"
            // Agrega todos los grados en orden descendente
    );

    private static int obtenerOrdenGrado(String grado) {
        int idx = ORDEN_GRADOS.indexOf(grado);
        return idx == -1 ? ORDEN_GRADOS.size() : idx;
    }

    // Comparador de antigüedad: grado, OPP/no OPP, luego antigüedad numérica
    public static int compararAntiguedad(AsignacionFuncionario a, AsignacionFuncionario b) {
        String gradoA = a.getSiglasCargo();
        String gradoB = b.getSiglasCargo();

        String baseA = gradoA.replace(" (OPP)", "");
        String baseB = gradoB.replace(" (OPP)", "");

        int ordenA = obtenerOrdenGrado(baseA);
        int ordenB = obtenerOrdenGrado(baseB);
        if (ordenA != ordenB) {
            return Integer.compare(ordenA, ordenB); // menor índice = más antiguo
        }

        boolean esOppA = gradoA.contains("OPP");
        boolean esOppB = gradoB.contains("OPP");

        if (esOppA != esOppB) {
            // El que NO es OPP es más antiguo
            return esOppA ? 1 : -1;
        }

        // Si grado y tipo OPP son iguales, manda la antigüedad numérica (mayor número = más antiguo)
        return Integer.compare(b.getAntiguedad(), a.getAntiguedad());
    }

    @Transactional
    public void asignacionAutomaticaPorPlantilla(int mes, int anio, String unidad) {

        TurnoAsignacion turnoAsignacion = turnoAsignacionRepo.findByMesAndAnioAndActivoTrue(mes, anio)
                .orElseThrow(() -> new RuntimeException("Mes no encontrado"));

        // Funcionarios de la unidad (puedes filtrar más si lo necesitas)
        List<AsignacionFuncionario> funcionarios = funcionarioRepo.findByMesAndAnioAndUnidad(mes, anio, unidad);
        if (funcionarios.isEmpty()) throw new RuntimeException("No hay funcionarios para la unidad");

        // Ordena de más antiguo a menos antiguo
        List<AsignacionFuncionario> funcionariosOrdenados = new ArrayList<>(funcionarios);
        funcionariosOrdenados.sort(DistribucionAutomaticaService::compararAntiguedad);

        // Carga todas las asignaciones previas (puedes filtrar por mes/unidad si lo prefieres)
        List<AsignacionFuncionarioTurno> asignacionesPrevias = asignacionTurnoRepo.findAll();

        // Carga restricciones de días no disponibles
        List<FuncionarioDiasNoDisponible> noDisponibles = noDisponibleRepo.obtenerPorMesYAnio(mes, anio);

        // Balanceo: mapa de cantidad de turnos por funcionario
        Map<Integer, Integer> turnosPorFuncionario = new HashMap<>();
        funcionarios.forEach(f -> turnosPorFuncionario.put(f.getIdFuncionario(), 0));
        for (AsignacionFuncionarioTurno a : asignacionesPrevias) {
            int idFun = a.getFuncionario().getIdFuncionario();
            turnosPorFuncionario.put(idFun, turnosPorFuncionario.getOrDefault(idFun, 0) + 1);
        }

        // Inicializa contexto de restricciones (si tienes más restricciones, agrégalas aquí)
        List<RestriccionTurno> restriccionesGlobales = List.of(
                new RestriccionAsignacionDiasNoDisponible(),
                new RestriccionRepeticionDiaFuncionario(),
                new RestriccionDiasConsecutivos(2)
        );
        ContextoRestriccionAsignacion contexto = new ContextoRestriccionAsignacion(
                asignacionesPrevias, noDisponibles, mes, anio
        );

        // Carga días y servicios diarios del mes
        List<DiaAsignacion> diasDelMes = diaAsignacionRepo.findByTurnoAsignacion(turnoAsignacion);
        List<ServicioDiario> servicios = servicioDiarioRepo.findByTurnoAsignacion(turnoAsignacion);

        // --- ASIGNACIÓN ---
        for (DiaAsignacion dia : diasDelMes) {
            // Filtra servicios de ese día
            List<ServicioDiario> serviciosEseDia = servicios.stream()
                    .filter(s -> s.getDiaAsignacion().getId().equals(dia.getId()))
                    .collect(Collectors.toList());

            Set<Integer> funcionariosAsignadosHoy = new HashSet<>();
            for (ServicioDiario servicio : serviciosEseDia) {
                PlantillaTurno plantilla = servicio.getPlantillaTurno();
                if (plantilla.getRoles() == null || plantilla.getRoles().isEmpty()) continue;

                for (RolPlantilla rolPlantilla : plantilla.getRoles()) {
                    for (int k = 0; k < rolPlantilla.getCantidad(); k++) {
                        // Fisher-Yates para balanceo aleatorio dentro del grupo
                        List<AsignacionFuncionario> candidatos = new ArrayList<>(funcionariosOrdenados);
                        Collections.shuffle(candidatos);

                        // Filtra por grados, ya asignados ese día, restricciones globales y de rol
                        candidatos = candidatos.stream()
                                .filter(f -> !funcionariosAsignadosHoy.contains(f.getIdFuncionario()))
                                .filter(f -> rolPlantilla.getGradosPermitidos() == null ||
                                        rolPlantilla.getGradosPermitidos().contains(f.getSiglasCargo()))
                                .filter(f -> restriccionesGlobales.stream()
                                        .allMatch(r -> r.permiteAsignacion(f, dia.getDia(), rolPlantilla.getNombreRol(), contexto)))
                                .sorted(Comparator.comparingInt(f -> turnosPorFuncionario.getOrDefault(f.getIdFuncionario(), 0)))
                                .collect(Collectors.toList());

                        if (!candidatos.isEmpty()) {
                            AsignacionFuncionario seleccionado = candidatos.get(0);

                            AsignacionFuncionarioTurno turno = new AsignacionFuncionarioTurno();
                            turno.setDiaAsignacion(dia);
                            turno.setFuncionario(seleccionado);
                            turno.setNombreTurno(rolPlantilla.getNombreRol());
                            turno.setServicioDiario(servicio);
                            asignacionTurnoRepo.save(turno);

                            funcionariosAsignadosHoy.add(seleccionado.getIdFuncionario());
                            turnosPorFuncionario.put(seleccionado.getIdFuncionario(),
                                    turnosPorFuncionario.getOrDefault(seleccionado.getIdFuncionario(), 0) + 1);
                        }
                        // Si no hay candidatos, puedes loggear o reportar la ausencia
                    }
                }
            }
        }
    }
}
