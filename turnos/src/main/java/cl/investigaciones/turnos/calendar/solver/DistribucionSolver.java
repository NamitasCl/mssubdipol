package cl.investigaciones.turnos.calendar.solver;

import cl.investigaciones.turnos.calendar.cache.FuncionarioCacheService;
import cl.investigaciones.turnos.calendar.domain.ConfiguracionReglas;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.AsignacionDTO;
import cl.investigaciones.turnos.calendar.repository.ConfiguracionReglasRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioDiaNoDisponibleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DistribucionSolver {
    
    @Autowired
    private ConfiguracionReglasRepository reglasRepo;
    
    @Autowired
    private FuncionarioCacheService funcionarioCache;
    
    @Autowired
    private FuncionarioDiaNoDisponibleRepository dndRepo;
    
    /**
     * Distribuye funcionarios a slots usando algoritmo greedy optimizado
     */
    public DistribucionResult distribuir(
            List<Integer> idsFuncionarios,
            List<Slot> slotsDisponibles,
            Map<Integer, Set<LocalDate>> diasNoDisponibles,
            Long idConfigReglas
    ) {
        long inicio = System.currentTimeMillis();
        
        // Cargar configuración
        ConfiguracionReglas reglas = reglasRepo.findById(idConfigReglas)
                .orElseGet(this::getReglasDefault);
        
        log.info("Iniciando distribución: {} funcionarios, {} slots, reglas={}",
                idsFuncionarios.size(), slotsDisponibles.size(), reglas.getNombre());
        
        // Cargar datos de funcionarios
        Map<Integer, Map<String, Object>> funcionarios = 
            funcionarioCache.obtenerVarios(idsFuncionarios);
        
        // Ordenar funcionarios por jerarquía y antiguedad
        List<Integer> funcionariosOrdenados = ordenarFuncionarios(funcionarios, reglas);
        
        // Ordenar slots por fecha
        List<Slot> slotsOrdenados = slotsDisponibles.stream()
                .sorted(Comparator.comparing(Slot::getFecha))
                .collect(Collectors.toList());
        
        // Estructuras de tracking
        Map<Integer, List<AsignacionDTO>> asignacionesPorFunc = new HashMap<>();
        Map<Long, AsignacionDTO> asignacionesPorSlot = new HashMap<>();
        List<String> advertencias = new ArrayList<>();
        
        // ALGORITMO PRINCIPAL: Greedy con backtracking
        boolean exitoso = resolverGreedy(
                funcionariosOrdenados,
                slotsOrdenados,
                funcionarios,
                diasNoDisponibles,
                reglas,
                asignacionesPorFunc,
                asignacionesPorSlot,
                advertencias
        );
        
        // Si no hay solución y se permite relajación, intentar con reglas más flexibles
        if (!exitoso && reglas.getPermitirBacktracking()) {
            log.warn("No se encontró solución óptima, intentando con reglas relajadas");
            ConfiguracionReglas reglasRelaj = clonarYRelajar(reglas);
            asignacionesPorFunc.clear();
            asignacionesPorSlot.clear();
            
            exitoso = resolverGreedy(
                    funcionariosOrdenados,
                    slotsOrdenados,
                    funcionarios,
                    diasNoDisponibles,
                    reglasRelaj,
                    asignacionesPorFunc,
                    asignacionesPorSlot,
                    advertencias
            );
            
            if (exitoso) {
                advertencias.add("Se usaron reglas relajadas para encontrar solución");
            }
        }
        
        // Construir resultado
        long tiempoTotal = System.currentTimeMillis() - inicio;
        return construirResultado(
                exitoso,
                asignacionesPorFunc,
                asignacionesPorSlot,
                slotsDisponibles.size(),
                advertencias,
                tiempoTotal
        );
    }
    
    private boolean resolverGreedy(
            List<Integer> funcionariosOrdenados,
            List<Slot> slots,
            Map<Integer, Map<String, Object>> datosFunc,
            Map<Integer, Set<LocalDate>> diasND,
            ConfiguracionReglas reglas,
            Map<Integer, List<AsignacionDTO>> asignaciones,
            Map<Long, AsignacionDTO> slotsCubiertos,
            List<String> advertencias
    ) {
        int iteracion = 0;
        int slotsNoCubiertos = 0;
        
        for (Slot slot : slots) {
            if (iteracion++ > reglas.getMaxIteraciones()) {
                log.warn("Se alcanzó el máximo de iteraciones");
                break;
            }
            
            if (slotsCubiertos.containsKey(slot.getId())) {
                continue; // Ya cubierto
            }
            
            // Buscar mejor candidato
            Optional<Integer> mejorCandidato = encontrarMejorCandidato(
                    funcionariosOrdenados,
                    slot,
                    datosFunc,
                    asignaciones,
                    diasND,
                    reglas
            );
            
            if (mejorCandidato.isPresent()) {
                Integer idFunc = mejorCandidato.get();
                AsignacionDTO asignacion = crearAsignacion(slot, idFunc, datosFunc.get(idFunc));
                
                asignaciones.computeIfAbsent(idFunc, k -> new ArrayList<>()).add(asignacion);
                slotsCubiertos.put(slot.getId(), asignacion);
            } else {
                slotsNoCubiertos++;
                advertencias.add("Slot sin cubrir: " + slot.getFecha() + " - " + slot.getNombreServicio());
            }
        }
        
        // Considerar exitoso si se cubrió al menos el 90%
        double porcentajeCubierto = (double)(slots.size() - slotsNoCubiertos) / slots.size();
        return porcentajeCubierto >= 0.9;
    }
    
    private Optional<Integer> encontrarMejorCandidato(
            List<Integer> funcionarios,
            Slot slot,
            Map<Integer, Map<String, Object>> datosFunc,
            Map<Integer, List<AsignacionDTO>> asignaciones,
            Map<Integer, Set<LocalDate>> diasND,
            ConfiguracionReglas reglas
    ) {
        return funcionarios.stream()
                .filter(idFunc -> puedeAsignar(idFunc, slot, asignaciones, diasND, reglas))
                .min((f1, f2) -> compararCandidatos(
                        f1, f2, datosFunc, asignaciones, reglas
                ));
    }
    
    private boolean puedeAsignar(
            Integer idFunc,
            Slot slot,
            Map<Integer, List<AsignacionDTO>> asignaciones,
            Map<Integer, Set<LocalDate>> diasND,
            ConfiguracionReglas reglas
    ) {
        // Constraint 1: Día no disponible
        if (reglas.getRespetarDiasNoDisponibles()) {
            Set<LocalDate> diasNoDisp = diasND.getOrDefault(idFunc, Set.of());
            if (diasNoDisp.contains(slot.getFecha())) {
                return false;
            }
        }
        
        List<AsignacionDTO> asigFunc = asignaciones.getOrDefault(idFunc, List.of());
        
        // Constraint 2: Separación mínima
        long turnosCerca = asigFunc.stream()
                .filter(a -> Math.abs(
                        ChronoUnit.DAYS.between(a.getFecha(), slot.getFecha())
                ) < reglas.getMinSeparacionDias())
                .count();
        if (turnosCerca > 0) {
            return false;
        }
        
        // Constraint 3: Max fines de semana
        if (esFinDeSemana(slot.getFecha())) {
            long findesAsignados = asigFunc.stream()
                    .filter(a -> esFinDeSemana(a.getFecha()))
                    .count();
            if (findesAsignados >= reglas.getMaxFinDeSemanaMes()) {
                return false;
            }
        }
        
        // Constraint 4: Max turnos consecutivos
        long consecutivos = contarConsecutivos(asigFunc, slot.getFecha());
        if (consecutivos >= reglas.getMaxTurnosConsecutivos()) {
            return false;
        }
        
        return true;
    }
    
    private int compararCandidatos(
            Integer f1,
            Integer f2,
            Map<Integer, Map<String, Object>> datosFunc,
            Map<Integer, List<AsignacionDTO>> asignaciones,
            ConfiguracionReglas reglas
    ) {
        // Prioridad 1: Balance - menos turnos asignados
        int turnos1 = asignaciones.getOrDefault(f1, List.of()).size();
        int turnos2 = asignaciones.getOrDefault(f2, List.of()).size();
        if (turnos1 != turnos2) {
            return Integer.compare(turnos1, turnos2);
        }
        
        // Prioridad 2: Jerarquía (si está habilitada)
        if (reglas.getConsiderarJerarquia()) {
            int jerarquia = compararJerarquia(datosFunc.get(f1), datosFunc.get(f2));
            if (jerarquia != 0) return jerarquia;
        }
        
        // Prioridad 3: Antiguedad
        if (reglas.getPriorizarAntiguedad()) {
            Integer ant1 = (Integer) datosFunc.get(f1).getOrDefault("antiguedad", 0);
            Integer ant2 = (Integer) datosFunc.get(f2).getOrDefault("antiguedad", 0);
            return Integer.compare(ant2, ant1); // Mayor antiguedad primero
        }
        
        return 0;
    }
    
    private int compararJerarquia(Map<String, Object> func1, Map<String, Object> func2) {
        // Orden de grados PDI (Menor índice = Mayor jerarquía)
        List<String> ordenGrados = Arrays.asList(
            "PFT", "SPF", "SPF (OPP)", "COM", "COM (OPP)", 
            "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", 
            "APS", "AP", "APP", "APP (AC)"
        );
        
        String grado1 = normalizeRank((String) func1.getOrDefault("siglasCargo", ""));
        String grado2 = normalizeRank((String) func2.getOrDefault("siglasCargo", ""));
        
        // Extraer grado base y verificar OPP
        String base1 = grado1.replace(" (OPP)", "").trim();
        String base2 = grado2.replace(" (OPP)", "").trim();
        
        int idx1 = ordenGrados.indexOf(grado1);
        int idx2 = ordenGrados.indexOf(grado2);
        
        // Si no está en la lista exacta, intentar buscar por base para fallback
        if (idx1 == -1) idx1 = ordenGrados.indexOf(base1);
        if (idx1 == -1) idx1 = 999;
        
        if (idx2 == -1) idx2 = ordenGrados.indexOf(base2);
        if (idx2 == -1) idx2 = 999;
        
        return Integer.compare(idx1, idx2);
    }

    private String normalizeRank(String rank) {
        if (rank == null) return "";
        return rank.trim().toUpperCase()
                .replace("  ", " ")
                .replace(" ( OPP)", " (OPP)")
                .replace("(OPP)", " (OPP)")
                .trim();
    }
    
    private boolean esFinDeSemana(LocalDate fecha) {
        DayOfWeek dow = fecha.getDayOfWeek();
        return dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
    }
    
    private long contarConsecutivos(List<AsignacionDTO> asignaciones, LocalDate fechaActual) {
        if (asignaciones.isEmpty()) return 0;
        
        List<LocalDate> fechasOrdenadas = asignaciones.stream()
                .map(AsignacionDTO::getFecha)
                .sorted()
                .collect(Collectors.toList());
        
        long maxConsecutivos = 0;
        long consecutivosActuales = 0;
        LocalDate fechaAnterior = null;
        
        for (LocalDate fecha : fechasOrdenadas) {
            if (fechaAnterior != null && ChronoUnit.DAYS.between(fechaAnterior, fecha) == 1) {
                consecutivosActuales++;
            } else {
                consecutivosActuales = 1;
            }
            maxConsecutivos = Math.max(maxConsecutivos, consecutivosActuales);
            fechaAnterior = fecha;
        }
        
        return maxConsecutivos;
    }
    
    private List<Integer> ordenarFuncionarios(
            Map<Integer, Map<String, Object>> funcionarios,
            ConfiguracionReglas reglas
    ) {
        return funcionarios.keySet().stream()
                .sorted((f1, f2) -> compararCandidatos(f1, f2, funcionarios, new HashMap<>(), reglas))
                .collect(Collectors.toList());
    }
    
    private AsignacionDTO crearAsignacion(Slot slot, Integer idFunc, Map<String, Object> datosFunc) {
        return AsignacionDTO.builder()
                .idSlot(slot.getId())
                .idFuncionario(idFunc)
                .nombreFuncionario((String) datosFunc.getOrDefault("nombreCompleto", "Desconocido"))
                .fecha(slot.getFecha())
                .tipoTurno(slot.getRolRequerido() != null ? slot.getRolRequerido().toString() : "")
                .nombreServicio(slot.getNombreServicio())
                .recinto(slot.getRecinto())
                .horaInicio(slot.getHoraInicio())
                .horaFin(slot.getHoraFin())
                .score(0.0)
                .build();
    }
    
    private DistribucionResult construirResultado(
            boolean exitoso,
            Map<Integer, List<AsignacionDTO>> asignaciones,
            Map<Long, AsignacionDTO> slotsCubiertos,
            int totalSlots,
            List<String> advertencias,
            long tiempoMs
    ) {
        // Calcular estadísticas
        int totalAsignaciones = asignaciones.values().stream()
                .mapToInt(List::size)
                .sum();
        
        double promedio = asignaciones.isEmpty() ? 0 :
                (double) totalAsignaciones / asignaciones.size();
        
        double desviacion = calcularDesviacionEstandar(asignaciones, promedio);
        
        int min = asignaciones.values().stream()
                .mapToInt(List::size)
                .min()
                .orElse(0);
        
        int max = asignaciones.values().stream()
                .mapToInt(List::size)
                .max()
                .orElse(0);
        
        DistribucionResult.EstadisticasDistribucion stats = 
            DistribucionResult.EstadisticasDistribucion.builder()
                .totalAsignaciones(totalAsignaciones)
                .totalSlots(totalSlots)
                .slotsNoCubiertos(totalSlots - slotsCubiertos.size())
                .porcentajeCobertura((double) slotsCubiertos.size() / totalSlots * 100)
                .promedioTurnosPorFuncionario(promedio)
                .desviacionEstandar(desviacion)
                .minTurnosPorFuncionario(min)
                .maxTurnosPorFuncionario(max)
                .build();
        
        return DistribucionResult.builder()
                .exitoso(exitoso)
                .mensaje(exitoso ? "Distribución completada exitosamente" : 
                        "No se pudo completar la distribución")
                .asignacionesPorFuncionario(asignaciones)
                .estadisticas(stats)
                .advertencias(advertencias)
                .tiempoEjecucionMs(tiempoMs)
                .build();
    }
    
    private double calcularDesviacionEstandar(
            Map<Integer, List<AsignacionDTO>> asignaciones,
            double promedio
    ) {
        if (asignaciones.isEmpty()) return 0.0;
        
        double sumaCuadrados = asignaciones.values().stream()
                .mapToDouble(list -> Math.pow(list.size() - promedio, 2))
                .sum();
        
        return Math.sqrt(sumaCuadrados / asignaciones.size());
    }
    
    private ConfiguracionReglas getReglasDefault() {
        ConfiguracionReglas reglas = new ConfiguracionReglas();
        reglas.setNombre("Default");
        reglas.setDescripcion("Configuración por defecto");
        return reglas;
    }
    
    private ConfiguracionReglas clonarYRelajar(ConfiguracionReglas original) {
        ConfiguracionReglas relajada = new ConfiguracionReglas();
        relajada.setNombre(original.getNombre() + " (relajada)");
        relajada.setMinSeparacionDias(Math.max(2, original.getMinSeparacionDias() - 1));
        relajada.setMaxFinDeSemanaMes(original.getMaxFinDeSemanaMes() + 1);
        relajada.setMaxTurnosConsecutivos(original.getMaxTurnosConsecutivos() + 1);
        relajada.setPesoSeparacion(original.getPesoSeparacion() * 0.8);
        relajada.setPesoBalance(original.getPesoBalance() * 1.2);
        return relajada;
    }
}
