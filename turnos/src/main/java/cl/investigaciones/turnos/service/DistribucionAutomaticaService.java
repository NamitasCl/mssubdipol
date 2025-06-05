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
    private ServicioDiarioRepository servicioDiarioRepo; // Nuevo repo

    @Transactional
    public void asignarTurnosDesdePlantillas(int mes, int anio, String unidad) {

        TurnoAsignacion turnoAsignacion = turnoAsignacionRepo.findByMesAndAnioAndActivoTrue(mes, anio)
                .orElseThrow(() -> new RuntimeException("Mes no encontrado"));

        List<AsignacionFuncionario> funcionarios = funcionarioRepo.findByMesAndAnioAndUnidad(mes, anio, unidad);
        if (funcionarios.isEmpty()) throw new RuntimeException("No hay funcionarios para la unidad");

        // Carga días y servicios diarios del mes
        List<DiaAsignacion> diasDelMes = diaAsignacionRepo.findByTurnoAsignacion(turnoAsignacion);
        List<ServicioDiario> servicios = servicioDiarioRepo.findByTurnoAsignacion(turnoAsignacion);

        List<AsignacionFuncionarioTurno> asignacionesPrevias = asignacionTurnoRepo.findAll();
        List<FuncionarioDiasNoDisponible> noDisponibles = noDisponibleRepo.obtenerPorMesYAnio(mes, anio);

        // Inicializa restricciones globales si corresponde
        // (puedes customizar para que algunas restricciones sean por rol o plantilla)
        List<RestriccionTurno> restriccionesGlobales = List.of(
                new RestriccionAsignacionDiasNoDisponible(),
                new RestriccionRepeticionDiaFuncionario(),
                new RestriccionDiasConsecutivos(2)
        );

        ContextoRestriccionAsignacion contexto = new ContextoRestriccionAsignacion(
                asignacionesPrevias, noDisponibles, mes, anio
        );

        // Para cada día y servicio, asignar turnos según la plantilla
        for (DiaAsignacion dia : diasDelMes) {
            for (ServicioDiario servicio : servicios) {
                if (servicio.getDiaAsignacion().getId() != dia.getId()) continue;

                PlantillaTurno plantilla = servicio.getPlantillaTurno();
                // Por ejemplo, supón que cada plantilla define roles a cubrir y cuántos de cada uno
                List<String> roles = obtenerRolesDesdePlantilla(plantilla);
                Map<String, Integer> cantidadPorRol = obtenerCantidadPorRol(plantilla);

                for (String rol : roles) {
                    int cantidad = cantidadPorRol.getOrDefault(rol, 1);
                    Set<Grado> gradosPermitidos = obtenerGradosPermitidos(plantilla);

                    // Restricciones particulares de esta plantilla
                    List<RestriccionTurno> restriccionesPlantilla = new ArrayList<>(restriccionesGlobales);
                    // Puedes agregar aquí restricciones propias de la plantilla (desde plantilla.getRestricciones())

                    for (int i = 0; i < cantidad; i++) {
                        // Filtra funcionarios por grado permitido y restricciones
                        Optional<AsignacionFuncionario> candidato = funcionarios.stream()
                                .filter(f -> gradosPermitidos.contains(Grado.parseGrado(f.getSiglasCargo())))
                                .filter(f -> restriccionesPlantilla.stream()
                                        .allMatch(r -> r.permiteAsignacion(f, dia.getDia(), rol, contexto)))
                                .findFirst();

                        if (candidato.isPresent()) {
                            AsignacionFuncionarioTurno turno = new AsignacionFuncionarioTurno();
                            turno.setDiaAsignacion(dia);
                            turno.setFuncionario(candidato.get());
                            turno.setNombreTurno(rol);
                            turno.setServicioDiario(servicio);
                            asignacionTurnoRepo.save(turno);
                        }
                    }
                }
            }
        }
    }

    // --- Métodos auxiliares para obtener información desde PlantillaTurno ---

    // Devuelve lista de roles a cubrir según la plantilla
    private List<String> obtenerRolesDesdePlantilla(PlantillaTurno plantilla) {
        // Si tu plantilla guarda roles en alguna lista, retornala aquí
        // Si sólo hay 1 rol, retorna List.of(plantilla.getNombre())
        // Si tienes una subentidad RolPlantilla, mapea los nombres
        // Ejemplo: plantilla.getRoles().stream().map(RolPlantilla::getNombre).toList()
        return List.of(plantilla.getNombre()); // Cambia esto por tu implementación real
    }

    private Map<String, Integer> obtenerCantidadPorRol(PlantillaTurno plantilla) {
        // Retorna Map<nombreRol, cantidad>
        // Ejemplo si tienes List<RolPlantilla>: roles.forEach(r -> map.put(r.getNombre(), r.getCantidad()))
        Map<String, Integer> map = new HashMap<>();
        map.put(plantilla.getNombre(), plantilla.getCantidadFuncionarios());
        return map;
    }

    private Set<Grado> obtenerGradosPermitidos(PlantillaTurno plantilla) {
        if (plantilla.getGradosPermitidos() == null) return Set.of();
        return plantilla.getGradosPermitidos().stream()
                .map(Grado::parseGrado)
                .collect(Collectors.toSet());
    }
}

