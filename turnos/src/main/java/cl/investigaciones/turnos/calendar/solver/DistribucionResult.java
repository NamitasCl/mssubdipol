package cl.investigaciones.turnos.calendar.solver;

import cl.investigaciones.turnos.calendar.dto.AsignacionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistribucionResult {
    
    private boolean exitoso;
    private String mensaje;
    
    @Builder.Default
    private Map<Integer, List<AsignacionDTO>> asignacionesPorFuncionario = new HashMap<>();
    
    private EstadisticasDistribucion estadisticas;
    
    @Builder.Default
    private List<String> advertencias = new ArrayList<>();
    
    @Builder.Default
    private List<String> errores = new ArrayList<>();
    
    private Long tiempoEjecucionMs;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticasDistribucion {
        private int totalAsignaciones;
        private int totalSlots;
        private int slotsNoCubiertos;
        private double porcentajeCobertura;
        
        private double promedioTurnosPorFuncionario;
        private double desviacionEstandar;
        private int minTurnosPorFuncionario;
        private int maxTurnosPorFuncionario;
        
        @Builder.Default
        private Map<String, Integer> distribucionPorTurno = new HashMap<>();
        
        @Builder.Default
        private Map<Integer, Integer> turnosPorFuncionario = new HashMap<>();
    }
}
