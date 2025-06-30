package cl.investigaciones.turnos.restriccion.implementaciones;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.plantilla.domain.RolServicio;
import lombok.Data;

import java.time.LocalDate;
import java.util.*;

@Data
public class ContextoAsignacion {

    //Funcionarios disponibles para asignacion
    private List<FuncionarioAporte> funcionarios = new ArrayList<>();

    // 1. Turnos ya asignados por funcionario (idFuncionario -> cantidad)
    private Map<Long, Integer> turnosPorFuncionario = new HashMap<>();

    // 2. Fechas asignadas por funcionario (idFuncionario -> lista de fechas donde ya fue asignado)
    private Map<Long, Map<LocalDate, String>> turnosPorFechaPorFuncionario = new HashMap<>();

    // 3. Días no disponibles por funcionario (idFuncionario -> set de fechas no disponibles)
    private Map<Long, Set<LocalDate>> diasNoDisponibles = new HashMap<>();

    // Nuevo: registro (idFuncionario, fecha, nombreServicio) -> nombreRol
    private Set<String> asignacionesPorFuncionarioFechaServicio = new HashSet<>();

    // (Opcional) Puedes agregar más estructuras según tus reglas
    private List<String> grados = List.of("PFT","SPF","SPF (OPP)","COM","COM (OPP)",
            "SBC","SBC (OPP)","ISP","SBI","DTV","APS","AP","APP","APP (AC)");

    private final Map<RolServicio, Set<String>> rolesGrado = Map.of(
            RolServicio.JEFE_DE_RONDA, Set.of("PFT", "PFT (OPP)", "SPF", "SPF (OPP)"),
            RolServicio.JEFE_DE_SERVICIO, Set.of("SPF", "SPF (OPP)", "COM", "COM (OPP)"),
            RolServicio.ENCARGADO_DE_GUARDIA, Set.of("COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP"),
            RolServicio.JEFE_DE_MAQUINA, Set.of("PFT", "PFT (OPP)", "SPF", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.AYUDANTE_DE_GUARDIA, Set.of("COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.PRIMER_TRIPULANTE, Set.of("PFT", "PFT (OPP)", "SPF", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.SEGUNDO_TRIPULANTE, Set.of("PFT", "PFT (OPP)", "SPF", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.TRIPULANTE, Set.of("PFT", "PFT (OPP)", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.GUARDIA_ARMADO, Set.of("COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)"),
            RolServicio.REFUERZO_DE_GUARDIA, Set.of("SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP (AC)")
    );

    // Agrega métodos para actualizar el contexto fácilmente

    public void agregarAsignacion(Long idFuncionario, LocalDate fechaServicio, String nombreTurno) {
        // Suma 1 al conteo de turnos
        turnosPorFuncionario.merge(idFuncionario, 1, Integer::sum);

        // Agrega la fecha asignada
        turnosPorFechaPorFuncionario
                .computeIfAbsent(idFuncionario, k -> new HashMap<>())
                .put(fechaServicio, nombreTurno);

        agregarAsignacionServicio(idFuncionario, fechaServicio, nombreTurno);
    }

    // clave: idFuncionario + fecha + nombreServicio
    private String claveAsignacion(Long idFuncionario, LocalDate fecha, String nombreServicio) {
        return idFuncionario + "|" + fecha + "|" + nombreServicio;
    }

    public boolean yaAsignadoAlServicio(Long idFuncionario, LocalDate fecha, String nombreServicio) {
        return asignacionesPorFuncionarioFechaServicio.contains(claveAsignacion(idFuncionario, fecha, nombreServicio));
    }

    public void agregarAsignacionServicio(Long idFuncionario, LocalDate fecha, String nombreServicio) {
        asignacionesPorFuncionarioFechaServicio.add(claveAsignacion(idFuncionario, fecha, nombreServicio));
    }

    public boolean gradoPuedeEjercerRol(RolServicio rol, String grado) {
        Set<String> gradosPermitidos = rolesGrado.get(rol);
        return gradosPermitidos != null && gradosPermitidos.contains(grado);
    }

}

